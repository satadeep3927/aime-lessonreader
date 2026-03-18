#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
#  AIME Lesson Studio — Installer
#  Supports: Debian / Ubuntu / ChromeOS Crostini (amd64)
#
#  One-liner install:
#    curl -sSL https://raw.githubusercontent.com/OWNER/REPO/main/public/assets/install.sh | sudo bash
#
#  Or with a local .deb:
#    sudo bash install.sh /path/to/AIME.Lesson.Studio_1.0.0_amd64.deb
# ─────────────────────────────────────────────────────────────────────────────

set -e

APP_NAME="AIME Lesson Studio"
# ── Change this to your GitHub owner/repo ─────────────────────────────────────
GITHUB_REPO="satadeep/aime-lessonreader"
# ─────────────────────────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

info()    { echo -e "${CYAN}[AIME]${RESET} $*"; }
success() { echo -e "${GREEN}[AIME]${RESET} $*"; }
warn()    { echo -e "${YELLOW}[AIME]${RESET} $*"; }
error()   { echo -e "${RED}[AIME] ERROR:${RESET} $*" >&2; }

# ── Root check ────────────────────────────────────────────────────────────────
if [ "$EUID" -ne 0 ]; then
  error "This installer must be run as root."
  echo  "       Re-run with: ${BOLD}sudo bash $0${RESET}"
  exit 1
fi

# ── Ensure curl & jq are available ───────────────────────────────────────────
for tool in curl; do
  if ! command -v "$tool" &>/dev/null; then
    info "Installing $tool..."
    apt-get install -y --no-install-recommends "$tool" -qq
  fi
done

# ── Resolve .deb — local file, explicit URL, or latest GitHub release ─────────
DEB_FILE=""
DEB_TMPFILE=""

cleanup() {
  [ -n "$DEB_TMPFILE" ] && rm -f "$DEB_TMPFILE"
}
trap cleanup EXIT

if [ -n "$1" ]; then
  # Argument is a URL
  if echo "$1" | grep -q '^https\?://'; then
    info "Downloading from URL: $1"
    DEB_TMPFILE="$(mktemp /tmp/aime-XXXXXX.deb)"
    curl -sSL --fail -o "$DEB_TMPFILE" "$1" || {
      error "Download failed: $1"
      exit 1
    }
    DEB_FILE="$DEB_TMPFILE"
  # Argument is a local file
  elif [ -f "$1" ]; then
    DEB_FILE="$1"
  else
    error "File not found and not a valid URL: $1"
    exit 1
  fi
else
  # Search locally first
  for pattern in "./*.deb" "$HOME/*.deb" "$HOME/Downloads/*.deb"; do
    match=$(ls $pattern 2>/dev/null | grep -i "aime" | head -1 || true)
    if [ -n "$match" ]; then
      DEB_FILE="$match"
      break
    fi
  done

  # Fall back to latest GitHub release
  if [ -z "$DEB_FILE" ]; then
    info "No local .deb found — fetching latest release from GitHub..."
    RELEASE_API="https://api.github.com/repos/${GITHUB_REPO}/releases/latest"
    DEB_URL=$(curl -sSL "$RELEASE_API" \
      | grep '"browser_download_url"' \
      | grep '\.deb"' \
      | grep -i 'amd64\|x86_64' \
      | head -1 \
      | sed 's/.*"browser_download_url": "\(.*\)"/\1/')

    if [ -z "$DEB_URL" ]; then
      error "Could not find a .deb in the latest GitHub release."
      echo  "       Check: https://github.com/${GITHUB_REPO}/releases/latest"
      echo  "       Or run: ${BOLD}sudo bash install.sh /path/to/package.deb${RESET}"
      exit 1
    fi

    info "Found: $(basename "$DEB_URL")"
    DEB_TMPFILE="$(mktemp /tmp/aime-XXXXXX.deb)"
    info "Downloading..."
    curl -sSL --fail --progress-bar -o "$DEB_TMPFILE" "$DEB_URL" || {
      error "Download failed."
      exit 1
    }
    DEB_FILE="$DEB_TMPFILE"
  fi
fi

info "Package ready: ${BOLD}$(basename "$DEB_FILE")${RESET}"

# ── Detect OS ────────────────────────────────────────────────────────────────
DEBIAN_VERSION=""
if [ -f /etc/os-release ]; then
  . /etc/os-release
  DEBIAN_VERSION="$VERSION_CODENAME"
fi

IS_CROSTINI=false
if [ -f /etc/debian_chroot ] && grep -qi "penguin" /proc/version 2>/dev/null; then
  IS_CROSTINI=true
fi

info "Detected OS: ${BOLD}${PRETTY_NAME:-Linux}${RESET}"
[ "$IS_CROSTINI" = true ] && info "ChromeOS Crostini environment detected."

# ── Update apt ────────────────────────────────────────────────────────────────
info "Updating package lists..."
apt-get update -qq

# ── WebKitGTK ────────────────────────────────────────────────────────────────
info "Checking WebKitGTK..."
if dpkg -l libwebkit2gtk-4.1-0 2>/dev/null | grep -q '^ii'; then
  success "libwebkit2gtk-4.1-0 already installed."
elif dpkg -l libwebkit2gtk-4.0-37 2>/dev/null | grep -q '^ii'; then
  success "libwebkit2gtk-4.0-37 already installed."
else
  info "Installing WebKitGTK..."
  apt-get install -y --no-install-recommends libwebkit2gtk-4.1-0 2>/dev/null || \
  apt-get install -y --no-install-recommends libwebkit2gtk-4.0-37 2>/dev/null || {
    error "Could not install WebKitGTK. Try adding the correct apt source for your Debian version."
    exit 1
  }
  success "WebKitGTK installed."
fi

# ── OpenGL / GLES ────────────────────────────────────────────────────────────
info "Checking OpenGL ES (libGLESv2)..."
if ldconfig -p 2>/dev/null | grep -q libGLESv2; then
  success "libGLESv2 already available."
else
  info "Installing Mesa GLES libraries..."
  apt-get install -y --no-install-recommends \
    libgles2-mesa libgl1-mesa-dri libgbm1 2>/dev/null || \
  apt-get install -y --no-install-recommends \
    libgles2 libgl1-mesa-dri libgbm1 2>/dev/null || \
  warn "Could not install GLES libs automatically. If the app crashes, run: sudo apt install libgles2-mesa"
fi

# ── GTK3 ─────────────────────────────────────────────────────────────────────
info "Checking GTK3..."
if ! dpkg -l libgtk-3-0 2>/dev/null | grep -q '^ii'; then
  info "Installing GTK3..."
  apt-get install -y --no-install-recommends libgtk-3-0 || \
  warn "GTK3 install failed — the app may not launch."
else
  success "GTK3 already installed."
fi

# ── App indicator (optional, suppresses warning) ──────────────────────────────
if ! dpkg -l libayatana-appindicator3-1 2>/dev/null | grep -q '^ii' && \
   ! dpkg -l libappindicator3-1 2>/dev/null | grep -q '^ii'; then
  apt-get install -y --no-install-recommends libayatana-appindicator3-1 2>/dev/null || \
  apt-get install -y --no-install-recommends libappindicator3-1 2>/dev/null || true
fi

# ── Install the .deb ─────────────────────────────────────────────────────────
echo ""
info "Installing ${BOLD}$APP_NAME${RESET}..."

# Remove any broken previous install
dpkg --purge aime-lesson-studio 2>/dev/null || true

apt-get install -y "$DEB_FILE" || {
  # Fallback: dpkg + fix-broken
  dpkg -i "$DEB_FILE" || true
  apt-get install -f -y
}

# ── Verify ───────────────────────────────────────────────────────────────────
echo ""
if dpkg -l aime-lesson-studio 2>/dev/null | grep -q '^ii'; then
  success "${BOLD}$APP_NAME installed successfully!${RESET}"
  echo ""
  echo -e "  Launch from your app menu, or run: ${BOLD}aime-lesson-studio${RESET}"
  echo ""
else
  error "Installation may have failed. Run ${BOLD}sudo apt install -f${RESET} to repair."
  exit 1
fi
