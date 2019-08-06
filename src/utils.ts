export function isMobile(): boolean {
  return getComputedStyle(document.body).getPropertyValue('--is-mobile').trim() == 'yes'
}