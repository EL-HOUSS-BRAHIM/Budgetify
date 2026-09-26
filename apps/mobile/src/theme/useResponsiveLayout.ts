import { useWindowDimensions } from 'react-native';
import { breakpoints, layout, type Breakpoint } from '../theme/tokens';

export interface ResponsiveLayout {
  width: number;
  height: number;
  /** The device class the current width falls into. */
  size: Breakpoint;
  isCompact: boolean;
  isExpanded: boolean;
  /** Horizontal page padding, wider once the screen has room for it. */
  gutter: number;
  /** Caps a reading column so text does not stretch across a tablet. */
  maxContentWidth: number;
  /** Columns for a card grid: one on a phone, two once there is room. */
  gridColumns: 1 | 2;
  /** Horizontal padding applied to centred, width-capped content. */
  contentPadding: number;
}

/**
 * Derives layout decisions from the live window size instead of hard-coded
 * dimensions.
 *
 * Two things this replaces. Screens that baked in `width: 375` or a fixed
 * three-across grid broke on a small phone, on a tablet, and on a foldable at
 * an intermediate width. Screens that did not break but never used the extra
 * room either, leaving 40-character lines across a 10-inch screen.
 *
 * Driven by `useWindowDimensions`, so it also reacts to rotation, split screen
 * and a resized window rather than only reading the size once on mount.
 */
export function useResponsiveLayout(): ResponsiveLayout {
  const { width, height } = useWindowDimensions();

  const size: Breakpoint =
    width >= breakpoints.expanded ? 'expanded' : width >= breakpoints.medium ? 'medium' : 'compact';

  const isExpanded = size === 'expanded';
  const gutter = isExpanded ? layout.gutterWide : layout.gutter;
  const maxContentWidth = layout.maxContentWidth;

  // Centre the capped column so the extra width becomes margin, not a longer line.
  const contentPadding = Math.max(gutter, (width - maxContentWidth) / 2);

  return {
    width,
    height,
    size,
    isCompact: size === 'compact',
    isExpanded,
    gutter,
    maxContentWidth,
    gridColumns: width >= breakpoints.medium ? 2 : 1,
    contentPadding,
  };
}

/** Width available to a capped column, never negative and never zero. */
export function contentColumnWidth(available: number, maxWidth = layout.maxContentWidth): number {
  return Math.max(0, Math.min(available, maxWidth));
}
