# Shared, side-effect-free validation for the named public tunnel task.
function Resolve-TunnelLocalPath([string]$Path, [bool]$Directory) {
  if (-not (Test-Path -LiteralPath $Path)) { throw "Required local tunnel path is missing: $Path" }
  $item = Get-Item -LiteralPath $Path -Force
  if ($item.PSProvider.Name -ne 'FileSystem' -or $item.PSIsContainer -ne $Directory) { throw "Unexpected tunnel path type: $Path" }
  $drive = [System.IO.DriveInfo]::new([System.IO.Path]::GetPathRoot($item.FullName))
  if ($drive.DriveType -ne [System.IO.DriveType]::Fixed -or -not $drive.IsReady) { throw "Tunnel paths require an available local fixed disk: $Path" }
  $current = $item
  while ($current) {
    if (($current.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) { throw "Tunnel paths must not use symbolic links or junctions: $Path" }
    $current = if ($current -is [IO.DirectoryInfo]) { $current.Parent } else { $current.Directory }
  }
  return $item.FullName.TrimEnd('\')
}

function Get-TunnelTaskSpec([string]$Root, [string]$TunnelId, [string]$ConfigPath, [string]$CredentialsPath, [string]$CloudflaredPath, [int]$MetricsPort, [switch]$AllowMissingArtifacts) {
  if (-not $TunnelId -or $TunnelId -notmatch '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$') { throw 'Pass the UUID of the existing named tunnel with -TunnelId.' }
  $TunnelId = $TunnelId.ToLowerInvariant()
  $Root = Resolve-TunnelLocalPath $Root $true
  $stateRoot = [IO.Path]::GetFullPath((Join-Path $Root '.local-server'))
  if (-not $AllowMissingArtifacts) { $stateRoot = Resolve-TunnelLocalPath $stateRoot $true }
  if (-not $ConfigPath) { $ConfigPath = Join-Path $stateRoot 'cloudflared.yml' }
  if (-not $CredentialsPath) { $CredentialsPath = Join-Path $stateRoot "$TunnelId.json" }
  if (-not $CloudflaredPath) { $CloudflaredPath = Join-Path $stateRoot 'cloudflared.exe' }
  if ($AllowMissingArtifacts) {
    # Removal checks the exact saved action; it must still work if a runtime
    # file was accidentally removed. This branch never reads/executes files.
    $ConfigPath = [IO.Path]::GetFullPath($ConfigPath)
    $CredentialsPath = [IO.Path]::GetFullPath($CredentialsPath)
    $CloudflaredPath = [IO.Path]::GetFullPath($CloudflaredPath)
  } else {
    $ConfigPath = Resolve-TunnelLocalPath $ConfigPath $false
    $CredentialsPath = Resolve-TunnelLocalPath $CredentialsPath $false
    $CloudflaredPath = Resolve-TunnelLocalPath $CloudflaredPath $false
  }
  foreach ($privatePath in @($ConfigPath, $CredentialsPath)) {
    if ((Split-Path -Parent $privatePath) -ine $stateRoot) { throw 'Keep the config and single-tunnel credentials directly inside this project''s .local-server directory.' }
  }
  if ($ConfigPath -ieq $CredentialsPath -or [IO.Path]::GetFileName($CloudflaredPath) -ine 'cloudflared.exe') { throw 'Use separate config and JSON credentials files, and an explicit cloudflared.exe binary.' }
  return [pscustomobject]@{
    Root = $Root; StateRoot = $stateRoot; TunnelId = $TunnelId
    ConfigPath = $ConfigPath; CredentialsPath = $CredentialsPath; CloudflaredPath = $CloudflaredPath
    TaskName = 'ark.insight Public Named Tunnel'; TaskPath = '\'; MetricsPort = $MetricsPort
    Description = "wagmi-public-tunnel/v1; root=$Root; tunnel=$TunnelId"
    Arguments = "tunnel --no-autoupdate --config `"$ConfigPath`" --metrics 127.0.0.1:$MetricsPort --loglevel warn run --credentials-file `"$CredentialsPath`" $TunnelId"
  }
}

function Assert-TunnelTaskOwnership($Task, $Spec) {
  $actions = @($Task.Actions)
  if ($Task.Description -cne $Spec.Description -or $actions.Count -ne 1 -or
      $actions[0].Execute -ine $Spec.CloudflaredPath -or
      $actions[0].WorkingDirectory -ine $Spec.StateRoot -or
      $actions[0].Arguments -cne $Spec.Arguments) {
    throw 'An unrecognized task uses the public tunnel task name. Refusing to change or stop it.'
  }
}

function Assert-TunnelReadAccess([string]$Path, [System.Security.AccessControl.FileSystemRights]$Required, [switch]$Private) {
  $serviceSids = @('S-1-5-19', 'S-1-1-0', 'S-1-5-11', 'S-1-5-6', 'S-1-5-32-545')
  $privateSids = @('S-1-5-19', 'S-1-5-18', 'S-1-5-32-544')
  [long]$allowed = 0
  foreach ($rule in (Get-Acl -LiteralPath $Path).Access) {
    if (($rule.PropagationFlags -band [System.Security.AccessControl.PropagationFlags]::InheritOnly) -ne 0) { continue }
    try { $sid = $rule.IdentityReference.Translate([System.Security.Principal.SecurityIdentifier]).Value } catch { $sid = '' }
    [long]$rights = $rule.FileSystemRights
    if ($Private -and $rule.AccessControlType -eq 'Allow' -and $sid -notin $privateSids) { throw 'Tunnel config/credentials permissions are too broad. Review and rerun with -SetLocalPermissions to restrict only .local-server.' }
    if ($sid -notin $serviceSids) { continue }
    if ($rule.AccessControlType -eq 'Deny' -and ($rights -band [long]$Required) -ne 0) { throw "LocalService has a relevant deny rule: $Path" }
    if ($Private -and $sid -eq 'S-1-5-19' -and $rule.AccessControlType -eq 'Allow') {
      [long]$readOnly = [System.Security.AccessControl.FileSystemRights]::ReadAndExecute -bor [System.Security.AccessControl.FileSystemRights]::Synchronize
      if (($rights -band (-bnot $readOnly)) -ne 0) { throw 'LocalService must not have write/control access to tunnel credentials or configuration.' }
    }
    if ($rule.AccessControlType -eq 'Allow') { $allowed = $allowed -bor $rights }
  }
  if (($allowed -band [long]$Required) -ne [long]$Required) { throw "Cannot confirm LocalService read/execute permissions: $Path" }
}

function Set-TunnelLocalPermissions($Spec) {
  # Every mutation is restricted to the checked .local-server directory or
  # explicit direct children. No profile, project, or global ACL is changed.
  $paths = @($Spec.StateRoot, $Spec.ConfigPath, $Spec.CredentialsPath)
  if ((Split-Path -Parent $Spec.CloudflaredPath) -ieq $Spec.StateRoot) { $paths += $Spec.CloudflaredPath }
  foreach ($path in $paths) {
    if ($path -ine $Spec.StateRoot -and (Split-Path -Parent $path) -ine $Spec.StateRoot) { throw 'Refusing an ACL change outside .local-server.' }
    $item = Get-Item -LiteralPath $path
    $acl = Get-Acl -LiteralPath $path
    $acl.SetAccessRuleProtection($true, $false)
    foreach ($rule in @($acl.Access)) { [void]$acl.RemoveAccessRuleSpecific($rule) }
    $inheritance = if ($item.PSIsContainer) { [Security.AccessControl.InheritanceFlags]'ContainerInherit, ObjectInherit' } else { [Security.AccessControl.InheritanceFlags]::None }
    foreach ($sid in @('S-1-5-32-544', 'S-1-5-18')) {
      $acl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new([Security.Principal.SecurityIdentifier]::new($sid), [Security.AccessControl.FileSystemRights]::FullControl, $inheritance, [Security.AccessControl.PropagationFlags]::None, [Security.AccessControl.AccessControlType]::Allow))
    }
    $rights = if ($item.PSIsContainer -or $path -ieq $Spec.CloudflaredPath) { [Security.AccessControl.FileSystemRights]::ReadAndExecute } else { [Security.AccessControl.FileSystemRights]::Read }
    $acl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new([Security.Principal.SecurityIdentifier]::new('S-1-5-19'), $rights, [Security.AccessControl.InheritanceFlags]::None, [Security.AccessControl.PropagationFlags]::None, [Security.AccessControl.AccessControlType]::Allow))
    Set-Acl -LiteralPath $path -AclObject $acl
  }
}
