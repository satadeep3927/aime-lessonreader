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
GITHUB_REPO="satadeep3927/aime-lessonreader"
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

# ── Remove any broken previous install FIRST ─────────────────────────────────
# A prior failed dpkg -i leaves the package in a broken/half-installed state
# that blocks ALL subsequent apt dependency resolution. Must purge before
# running apt-get update or installing anything.
if dpkg -l aime-lesson-studio 2>/dev/null | grep -qE '^(iU|iF|iH|pH|pU|pF|pH)'; then
  info "Removing broken previous installation..."
  dpkg --purge --force-all aime-lesson-studio 2>/dev/null || true
fi
apt-get install -f -y -qq 2>/dev/null || true   # repair any remaining broken state

# ── Update apt ────────────────────────────────────────────────────────────────
info "Updating package lists..."
apt-get update -qq

# ── Install all runtime dependencies in one shot ──────────────────────────────
# Installing individually causes ordering problems; let apt resolve the full
# dependency tree at once. libwebkit2gtk-4.1-0 pulls in gstreamer, bubblewrap,
# xdg-dbus-proxy, libgles2, etc. automatically.
info "Installing runtime dependencies..."
apt-get install -y \
  libwebkit2gtk-4.1-0 \
  libgtk-3-0 \
  libglib2.0-0 \
  libgl1-mesa-dri \
  libgbm1 2>/dev/null || \
apt-get install -y \
  libwebkit2gtk-4.0-37 \
  libgtk-3-0 \
  libglib2.0-0 \
  libgl1-mesa-dri \
  libgbm1 2>/dev/null || {
    error "Could not install required dependencies."
    echo  "       On ChromeOS, try: Settings → Linux → Expand disk size (needs ~500 MB free)"
    echo  "       Then re-run this installer."
    exit 1
  }

# App indicator — optional, silent failure is fine
apt-get install -y libayatana-appindicator3-1 2>/dev/null || \
apt-get install -y libappindicator3-1 2>/dev/null || true

success "Dependencies installed."

# ── Install the .deb ─────────────────────────────────────────────────────────
echo ""
info "Installing ${BOLD}$APP_NAME${RESET}..."

DPKG_FORCE_CONFNEW=yes DEBIAN_FRONTEND=noninteractive \
  apt-get install -y "$DEB_FILE" || {
    # Last-resort fallback
    dpkg -i "$DEB_FILE" || true
    apt-get install -f -y
  }

# ── Crostini: disable WebKit sandbox if bubblewrap is unavailable ────────────
# bubblewrap requires kernel user namespaces which ChromeOS may deny.
# The wrapper script sets the env var so the app still launches.
if [ "$IS_CROSTINI" = true ]; then
  WRAPPER="/usr/local/bin/aime-lesson-studio"
  REAL_BIN=$(command -v aime-lesson-studio 2>/dev/null || echo "/usr/bin/aime-lesson-studio")
  if [ -f "$REAL_BIN" ] && [ "$REAL_BIN" != "$WRAPPER" ]; then
    mv "$REAL_BIN" "${REAL_BIN}.real"
    cat > "$REAL_BIN" << EOF
#!/bin/sh
exec env WEBKIT_DISABLE_SANDBOX_THIS_IS_DANGEROUS=1 "${REAL_BIN}.real" "\$@"
EOF
    chmod +x "$REAL_BIN"
    info "ChromeOS: WebKit sandbox wrapper installed."
  fi
fi

# ── Verify ───────────────────────────────────────────────────────────────────
echo ""
if dpkg -l aime-lesson-studio 2>/dev/null | grep -q '^ii'; then
  success "${BOLD}$APP_NAME installed successfully!${RESET}"
  echo ""
  echo -e "  Launch from your app menu, or run: ${BOLD}aime-lesson-studio${RESET}"
  if [ "$IS_CROSTINI" = true ]; then
    echo -e "  ${YELLOW}ChromeOS tip:${RESET} If the app doesn't appear in your launcher, log out and back in."
  fi
  echo ""
else
  error "Installation may have failed. Run ${BOLD}sudo apt install -f${RESET} to repair."
  exit 1
fi
