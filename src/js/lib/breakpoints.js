module.exports = {
  isMobile: window.matchMedia("(max-width: 500px)").matches,
  isDesktop: window.matchMedia("(min-width: 501px)").matches
};