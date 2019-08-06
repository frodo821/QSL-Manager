export function isMobile(): boolean {
  return document.documentElement.style.getPropertyValue('--is-mobile').trim() == 'yes'
}