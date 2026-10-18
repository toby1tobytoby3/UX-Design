// react-grid-layout 2.3: dashboard tiles on a 12-column grid (120 px columns at 1440 px), east-edge resize handles,
// layout persisted with onLayoutChange. It is the tiles model, not a splitter: neighbours reflow instead of shrinking.
import { React, mount, title, expose, Pane, load, save } from '../shared.jsx';
import ReactGridLayout, { useContainerWidth } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

title('react-grid-layout 2.3');
expose({ handle: '.react-resizable-handle', model: 'tiles', tile: '.react-grid-item' });

const ROW = 20, ROWS = Math.floor((900 - 40) / ROW);
const initial = [
  { i: 'explorer', x: 0, y: 0, w: 2, h: ROWS, minW: 1, maxW: 4 },
  { i: 'editor', x: 2, y: 0, w: 7, h: ROWS },
  { i: 'inspector', x: 9, y: 0, w: 3, h: ROWS, minW: 1, maxW: 4 },
];
function App() {
  const { width, containerRef, mounted } = useContainerWidth({ measureBeforeMount: true });
  return (
    <div ref={containerRef} style={{ height: '100%' }}>
      {mounted && (
        <ReactGridLayout width={width} layout={load() ?? initial} onLayoutChange={(l) => save(l)}
          gridConfig={{ cols: 12, rowHeight: ROW, margin: [0, 0], containerPadding: [0, 0] }} resizeConfig={{ handles: ['e'] }}>
          {initial.map(({ i }) => <div key={i}><Pane id={i} /></div>)}
        </ReactGridLayout>
      )}
    </div>
  );
}
mount(<App />);
