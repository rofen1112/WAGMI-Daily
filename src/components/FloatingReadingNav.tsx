import { Drawer } from 'antd';
import { useEffect, useId, useRef, useState } from 'react';

interface ReadingNavItem {
  name: string;
  count: number;
  targetId: string;
}

interface FloatingReadingNavProps {
  entities: ReadingNavItem[];
  boards: ReadingNavItem[];
  onEventSelect: (eventId: string) => void;
  onBoardSelect: (boardName: string) => void;
}

type IndexKind = 'entities' | 'boards';

export default function FloatingReadingNav({ entities, boards, onEventSelect, onBoardSelect }: FloatingReadingNavProps) {
  const [minimized, setMinimized] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [indexKind, setIndexKind] = useState<IndexKind>('entities');
  const pendingJump = useRef<(() => void) | null>(null);
  const contentId = useId();
  const effectiveKind = entities.length ? indexKind : 'boards';

  useEffect(() => {
    if (mobileOpen || !pendingJump.current) return;
    let frame = 0;
    const finishJump = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // Observe the actual lock cleanup, including an interrupted opening
        // animation; a motion-end callback is not guaranteed in that case.
        if (document.querySelector('.ai-reading-nav-drawer.ant-drawer-open')
          || getComputedStyle(document.body).overflowY === 'hidden') return;
        const navigate = pendingJump.current;
        pendingJump.current = null;
        observer.disconnect();
        navigate?.();
      });
    };
    const observer = new MutationObserver(finishJump);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    observer.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });
    finishJump();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [mobileOpen]);

  const jump = (item: ReadingNavItem, mobile: boolean, kind: IndexKind) => {
    const navigate = () => kind === 'entities' ? onEventSelect(item.targetId) : onBoardSelect(item.name);
    if (mobile) {
      // Let the drawer release its focus trap and page scroll lock before jumping.
      pendingJump.current = navigate;
      setMobileOpen(false);
    } else navigate();
  };

  const renderIndex = (mobile: boolean) => {
    const kind = mobile ? effectiveKind : entities.length ? 'entities' : 'boards';
    return <>
      {mobile && entities.length > 0 && (
        <div className="ai-floating-nav-tabs" aria-label="跳转索引类型">
          <button type="button" aria-pressed={effectiveKind === 'entities'} onClick={() => setIndexKind('entities')}>重点对象</button>
          <button type="button" aria-pressed={effectiveKind === 'boards'} onClick={() => setIndexKind('boards')}>内容板块</button>
        </div>
      )}
      <nav className="ai-floating-nav-list" aria-label={kind === 'entities' ? '按重点对象跳转' : '按内容板块跳转'}>
        {(kind === 'entities' ? entities : boards).map((item) => (
          <button type="button" onClick={() => jump(item, mobile, kind)} key={item.name} title={`${item.name}，${item.count} 条资讯`}>
            <span>{item.name}</span><strong>{item.count}</strong>
          </button>
        ))}
      </nav>
    </>;
  };

  return (
    <aside className={`ai-entity-index${entities.length ? '' : ' without-entities'}`} aria-label="阅读索引">
      <div className={`ai-entity-index-inner ai-floating-nav-desktop${minimized ? ' minimized' : ''}`}>
        <div className="ai-floating-nav-header">
          <div><p className="eyebrow">Entity index</p><h2>重点对象</h2></div>
          <button className="ai-floating-nav-minimize" type="button" aria-label={minimized ? '展开重点对象' : '收起重点对象'} aria-expanded={!minimized} aria-controls={contentId} onClick={() => setMinimized((value) => !value)}>
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d={minimized ? 'M3 8h10M8 3v10' : 'M3 8h10'} /></svg>
          </button>
        </div>
        <div className="ai-floating-nav-content" id={contentId} hidden={minimized}>{renderIndex(false)}</div>
      </div>

      <button className="ai-mobile-nav-trigger" type="button" aria-haspopup="dialog" aria-expanded={mobileOpen} onClick={() => { pendingJump.current = null; setMobileOpen(true); }}>
        <svg viewBox="0 0 18 18" aria-hidden="true"><path d="M7 4h8M7 9h8M7 14h8M3 4h.01M3 9h.01M3 14h.01" /></svg>
        {entities.length ? '重点对象' : '内容板块'}
      </button>
      <Drawer title={entities.length ? '重点对象' : '内容板块'} placement="bottom" size="min(70dvh, 560px)" open={mobileOpen} onClose={() => setMobileOpen(false)} rootClassName="ai-reading-nav-drawer">
        {renderIndex(true)}
      </Drawer>
    </aside>
  );
}
