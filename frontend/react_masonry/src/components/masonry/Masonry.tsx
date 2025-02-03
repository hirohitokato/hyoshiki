/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import FlipMove from "react-flip-move";

const DEFAULT_COLUMNS = 2;

type BreakpointCols = number | { default: number; [key: string]: number };

const reCalculateColumnCount = (
  breakpointCols: BreakpointCols | undefined
): number => {
  const windowWidth =
    typeof window !== "undefined" && window.innerWidth
      ? window.innerWidth
      : Infinity;
  let breakpointColsObject: { [key: string]: number } = {};

  // breakpointCols が number 型の場合はオブジェクトに変換
  if (typeof breakpointCols !== "object") {
    breakpointColsObject = { default: parseInt(String(breakpointCols)) || DEFAULT_COLUMNS };
  } else {
    breakpointColsObject = breakpointCols;
  }

  let matchedBreakpoint = Infinity;
  let columns = breakpointColsObject.default || DEFAULT_COLUMNS;

  for (const breakpoint in breakpointColsObject) {
    const optBreakpoint = parseInt(breakpoint);
    const isCurrentBreakpoint = optBreakpoint > 0 && windowWidth <= optBreakpoint;

    if (isCurrentBreakpoint && optBreakpoint < matchedBreakpoint) {
      matchedBreakpoint = optBreakpoint;
      columns = breakpointColsObject[breakpoint];
    }
  }

  columns = Math.max(1, columns);
  return columns;
};

const reCalculateColumnCountDebounce = (
  columnCountCallback: () => void,
  lastFrameRef: React.MutableRefObject<number | null>
): void => {
  if (typeof window === "undefined" || !window.requestAnimationFrame) {
    columnCountCallback();
    return;
  }

  if (window.cancelAnimationFrame && lastFrameRef.current !== null) {
    window.cancelAnimationFrame(lastFrameRef.current);
  }

  lastFrameRef.current = window.requestAnimationFrame(columnCountCallback);
};

interface BalanceContext {
  itemsColumns: React.ReactElement<any>[][];
  heights: number[];
  refPropName: string;
  done: boolean;
}

const moveOddItem = (ctx: BalanceContext): void => {
  const { itemsColumns, heights, refPropName } = ctx;

  const [minCol, maxCol] = heights.reduce<[number, number]>(
    (acc, num, index, arr) => {
      if (num < arr[acc[0]]) acc[0] = index;
      if (num > arr[acc[1]]) acc[1] = index;
      return acc;
    },
    [0, 0]
  );

  const maxColItems = itemsColumns[maxCol];
  const lastItem = maxColItems[maxColItems.length - 1];
  const oddHeight = Number(lastItem.props[refPropName]);

  // 移動後、対象カラムが最長にならない場合に移動
  if (heights[minCol] + oddHeight < heights[maxCol]) {
    const item = maxColItems.pop() as React.ReactElement<any>;
    itemsColumns[minCol].push(item);
    heights[maxCol] -= oddHeight;
    heights[minCol] += oddHeight;
  } else {
    ctx.done = true;
  }
};

const balanceColumns = (
  itemsColumns: React.ReactElement<any>[][],
  refPropName: string
): React.ReactElement<any>[][] => {
  const heights = itemsColumns.map(items => {
    let sum = 0;
    for (let i = 0; i < items.length; i++) {
      const h = Number(items[i].props[refPropName]);
      if (typeof h === "number" && !isNaN(h)) {
        sum += h;
      } else {
        return -1;
      }
    }
    return sum;
  });

  if (heights.some(h => h <= 0)) {
    return itemsColumns; // 高さ情報が正しく取得できない場合、元の状態を返す
  }

  const ctx: BalanceContext = {
    itemsColumns,
    heights,
    refPropName,
    done: false,
  };

  while (!ctx.done) {
    moveOddItem(ctx);
  }
  return itemsColumns;
};

const itemsInColumns = (
  currentColumnCount: number,
  children: React.ReactNode
): React.ReactElement<any>[][] => {
  const itemsInColumns: React.ReactElement<any>[][] = new Array(currentColumnCount);
  const items = React.Children.toArray(children) as React.ReactElement<any>[];

  for (let i = 0; i < items.length; i++) {
    const columnIndex = i % currentColumnCount;

    if (!itemsInColumns[columnIndex]) {
      itemsInColumns[columnIndex] = [];
    }

    itemsInColumns[columnIndex].push(items[i]);
  }

  return itemsInColumns;
};

const logDeprecated = (message: string): void => {
  console.error("[Masonry]", message);
};

interface RenderColumnsParams {
  children: React.ReactNode;
  currentColumnCount: number;
  column?: React.HTMLAttributes<HTMLDivElement>;
  columnAttrs?: React.HTMLAttributes<HTMLDivElement>;
  columnClassName?: string;
  itemHeightProp?: string;
}

const renderColumns = ({
  children,
  currentColumnCount,
  column,
  columnAttrs = {},
  columnClassName,
  itemHeightProp,
}: RenderColumnsParams): React.ReactNode => {
  const childrenInColumns = itemsInColumns(currentColumnCount, children);

  if (itemHeightProp) {
    balanceColumns(childrenInColumns, itemHeightProp);
  }

  const columnWidth = `${100 / childrenInColumns.length}%`;
  let className = columnClassName;

  if (className && typeof className !== "string") {
    logDeprecated('The property "columnClassName" requires a string');
    if (typeof className === "undefined") {
      className = "my-masonry-grid_column";
    }
  }

  const columnAttributes = {
    // column プロパティは deprecated であり、columnAttrs のエイリアスとなっている
    ...column,
    ...columnAttrs,
    style: {
      ...columnAttrs.style,
      width: columnWidth,
    },
    className,
  };

  return childrenInColumns.map((items, i) => (
    <div {...columnAttributes} key={i}>
      {/* FlipMove により、子要素の再配置時に FLIP アニメーションを適用 */}
      <FlipMove duration={500} easing="ease-out">
        {items.map(item => (
          // 各アイテムには必ずユニークな key を設定すること
          <div key={item.key ? item.key.toString() : Math.random().toString()}>
            {item}
          </div>
        ))}
      </FlipMove>
    </div>
  ));
};

interface MasonryProps extends React.HTMLAttributes<HTMLDivElement> {
  breakpointCols?: BreakpointCols;
  className?: string;
  columnClassName?: string;
  children?: React.ReactNode;
  itemHeightProp?: string;
  columnAttrs?: React.HTMLAttributes<HTMLDivElement>;
  column?: React.HTMLAttributes<HTMLDivElement>;
}

const Masonry: React.FC<MasonryProps> = ({
  breakpointCols,
  className,
  columnClassName,
  children,
  itemHeightProp,
  columnAttrs,
  column,
  ...rest
}) => {
  const [columnCount, setColumnCount] = React.useState<number>(() => {
    let count: number;
    if (typeof breakpointCols === "object" && breakpointCols && breakpointCols.default) {
      count = breakpointCols.default;
    } else if (typeof breakpointCols === "number") {
      count = breakpointCols;
    } else {
      count = DEFAULT_COLUMNS;
    }
    return count;
  });

  const lastFrameRef = React.useRef<number | null>(null);

  const columnCountCallback = React.useCallback(() => {
    const columns = reCalculateColumnCount(breakpointCols);
    if (columnCount !== columns) {
      setColumnCount(columns);
    }
  }, [breakpointCols, columnCount]);

  React.useLayoutEffect(() => {
    columnCountCallback();
    const handleWindowResize = () => {
      reCalculateColumnCountDebounce(columnCountCallback, lastFrameRef);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleWindowResize);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleWindowResize);
      }
    };
  }, [columnCountCallback]);

  let classNameOutput = className;
  if (className && typeof className !== "string") {
    logDeprecated('The property "className" requires a string');
    if (typeof className === "undefined") {
      classNameOutput = "my-masonry-grid";
    }
  }
  return (
    <div {...rest} className={classNameOutput}>
      {renderColumns({
        children,
        currentColumnCount: columnCount,
        column,
        columnAttrs,
        columnClassName,
        itemHeightProp,
      })}
    </div>
  );
};

export default Masonry;
