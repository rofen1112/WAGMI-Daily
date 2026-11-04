import { Button, ConfigProvider, Drawer, Result, Spin } from 'antd';
import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import ThemePicker from './components/ThemePicker';
import { formatDate, loadSnapshot } from './data';
import { routeHref, type RouteName, useHashRoute } from './router';
import { applyTheme, buildThemeColors, readStoredTheme, storeTheme, type ThemeSettings } from './theme';
import type { Snapshot } from './types';

const isAdminBuild = import.meta.env.MODE === 'admin';
const isLabBuild = import.meta.env.MODE === 'lab';
const AiLabPage = isLabBuild ? lazy(() => import('./features/ai-lab/AiLabPage')) : null;
const AiLabHub = isLabBuild ? lazy(() => import('./features/ai-lab/AiLabHub')) : null;
const AiEventsPage = lazy(() => import('./pages/AiEventsPage'));
const GithubRadarPage = lazy(() => import('./pages/GithubRadarPage'));
const OperationsPage = isAdminBuild ? lazy(() => import('./pages/OperationsPage')) : null;
const SkillsRadarPage = lazy(() => import('./pages/SkillsRadarPage'));
const PapersLibraryPage = lazy(() => import('./pages/PapersLibraryPage'));
const TodayPage = lazy(() => import('./pages/TodayPage'));
const WatchlistPage = isAdminBuild ? lazy(() => import('./pages/WatchlistPage')) : null;

const storageKey = 'wagmi-daily-followed-projects-v1';

const publicNav: { route: RouteName; label: string }[] = [
  { route: 'today', label: '今日' },
  { route: 'ai', label: 'AI 大事件' },
  { route: 'github', label: 'GitHub Radar' },
  { route: 'skills', label: 'Skill 能力库' },
];
publicNav.push({ route: 'papers', label: '论文研究库' });

const adminNav: { route: RouteName; label: string }[] = [
  ...publicNav,
  { route: 'watchlist', label: '我的关注' },
  { route: 'operations', label: '任务运行' },
];
const labNav: { route: RouteName; label: string }[] = [...publicNav, { route: 'ai-lab', label: 'AI 实验室' }];

function readFollowed(): Set<string> {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    return new Set(Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []);
  } catch {
    return new Set();
  }
}

export default function App() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [followed, setFollowed] = useState<Set<string>>(readFollowed);
  const [theme, setTheme] = useState<ThemeSettings>(readStoredTheme);
  const { route, params, navigate, updateParams } = useHashRoute(isAdminBuild, isLabBuild);
  const isLabRoute = isLabBuild && route === 'ai-lab';
  const labTool = params.get('tool');
  const isLabToolRoute = isLabRoute && (labTool === 'floorplan3d' || (!labTool && Boolean(params.get('projectId'))));
  const navigation = isLabBuild ? labNav : isAdminBuild ? adminNav : publicNav;
  const themeColors = useMemo(() => buildThemeColors(theme), [theme]);

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (isLabRoute) return;
    const controller = new AbortController();
    setError(null);
    loadSnapshot(controller.signal)
      .then(setSnapshot)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : '数据加载失败');
      });
    return () => controller.abort();
  }, [reloadKey, isLabRoute]);

  useEffect(() => {
    if (isLabToolRoute) {
      document.title = 'Floorplan-Editor · AI 实验室';
      return;
    }
    const current = navigation.find((item) => item.route === route);
    document.title = `${current?.label ?? '今日'} · ark.insight`;
  }, [navigation, route, isLabToolRoute]);

  const toggleFollow = (projectId: string) => {
    setFollowed((current) => {
      const next = new Set(current);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      localStorage.setItem(storageKey, JSON.stringify([...next]));
      return next;
    });
  };

  const page = useMemo(() => {
    if (isLabRoute) {
      if (isLabToolRoute && AiLabPage) return <AiLabPage />;
      return AiLabHub ? <AiLabHub /> : null;
    }
    if (!snapshot) return null;
    if (route === 'ai') return <AiEventsPage snapshot={snapshot} params={params} updateParams={updateParams} />;
    if (route === 'github') {
      return (
        <GithubRadarPage
          snapshot={snapshot}
          params={params}
          isAdmin={isAdminBuild}
          followed={followed}
          updateParams={updateParams}
          toggleFollow={toggleFollow}
        />
      );
    }
    if (route === 'skills') return <SkillsRadarPage snapshot={snapshot} params={params} updateParams={updateParams} />;
    if (route === 'papers') return <PapersLibraryPage params={params} isAdmin={isAdminBuild} updateParams={updateParams} />;
    if (route === 'watchlist' && isAdminBuild && WatchlistPage) {
      return (
        <WatchlistPage
          snapshot={snapshot}
          params={params}
          followed={followed}
          updateParams={updateParams}
          toggleFollow={toggleFollow}
          onCandidateChanged={() => setReloadKey((value) => value + 1)}
        />
      );
    }
    if (route === 'operations' && isAdminBuild && OperationsPage) return <OperationsPage snapshot={snapshot} onPublished={() => setReloadKey((value) => value + 1)} />;
    return <TodayPage snapshot={snapshot} isAdmin={isAdminBuild} navigate={navigate} />;
  }, [followed, navigate, params, route, snapshot, updateParams, isLabRoute, isLabToolRoute]);

  const navigateFromMenu = (target: RouteName) => {
    setMenuOpen(false);
    navigate(target);
  };

  const updateTheme = (nextTheme: ThemeSettings) => {
    setTheme(nextTheme);
    storeTheme(nextTheme);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: themeColors.accent,
          colorInfo: '#476a8a',
          colorLink: '#365f91',
          colorText: '#201f1d',
          colorTextSecondary: '#6d6760',
          colorBorder: themeColors.border,
          colorBgLayout: themeColors.page,
          colorBgContainer: themeColors.surface,
          borderRadius: 6,
          fontFamily: 'Inter, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
        },
      }}
    >
      <div className={`app-shell${isLabToolRoute ? ' lab-shell' : ''}`}>
        {!isLabToolRoute && <header className="app-header">
          <div className="header-inner">
            <a className="brand" href={routeHref('today')}>
              <span className="brand-mark" aria-hidden="true"><img src="/brand/ark-ghost.png" alt="" /></span>
              <span>
                <strong>ark.insight</strong>
                <small>深度 AI 行业观察、趋势分析专栏</small>
              </span>
            </a>

            <nav className="desktop-nav" aria-label="主导航">
              {navigation.map((item) => (
                <a className={route === item.route ? 'active' : ''} href={routeHref(item.route)} key={item.route}>{item.label}</a>
              ))}
            </nav>

            <div className="header-meta">
              {snapshot && !isLabRoute && <span>更新 {formatDate(snapshot.generatedAt, true)}</span>}
              {isAdminBuild && <span className="admin-badge">本地管理</span>}
              <ThemePicker value={theme} onChange={updateTheme} />
              <Button className="mobile-menu-button" onClick={() => setMenuOpen(true)}>菜单</Button>
            </div>
          </div>
        </header>}

        <main className={`app-main${isLabToolRoute ? ' lab-main' : ''}`} style={isLabToolRoute ? { width: '100%', maxWidth: 'none', margin: 0, padding: 0 } : undefined}>
          {isLabRoute ? <Suspense fallback={<div className="loading-state"><Spin size="large" /><span>正在打开实验室</span></div>}>{page}</Suspense> : error ? (
            <Result
              status="warning"
              title="数据暂时无法加载"
              subTitle={error}
              extra={<Button type="primary" onClick={() => setReloadKey((value) => value + 1)}>重新加载</Button>}
            />
          ) : !snapshot ? (
            <div className="loading-state"><Spin size="large" /><span>正在读取最新快照</span></div>
          ) : <Suspense fallback={<div className="loading-state"><Spin size="large" /><span>正在打开页面</span></div>}>{page}</Suspense>}
        </main>

        {snapshot && !isLabRoute && (
          <footer className="app-footer">
            <span>ark.insight</span>
            <span>GitHub {formatDate(snapshot.asOf.github)} · AI {formatDate(snapshot.asOf.ai)} · Skill {formatDate(snapshot.asOf.skills)}</span>
          </footer>
        )}

        <Drawer title="导航" placement="right" size={300} open={menuOpen} onClose={() => setMenuOpen(false)}>
          <nav className="mobile-nav" aria-label="移动端导航">
            {navigation.map((item) => (
              <button className={route === item.route ? 'active' : ''} type="button" onClick={() => navigateFromMenu(item.route)} key={item.route}>{item.label}</button>
            ))}
          </nav>
        </Drawer>
      </div>
    </ConfigProvider>
  );
}
