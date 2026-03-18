#!/bin/sh
set -e

# ── Ensure WebKitGTK is present ───────────────────────────────────────────────
# Tauri 2 requires libwebkit2gtk-4.1-0 (Debian 12 / Ubuntu 22.04+).
# Older Crostini / Debian 11 environments only have libwebkit2gtk-4.0-37.
# This block attempts to install whichever variant is available.
_have_webkit() {
  dpkg -l libwebkit2gtk-4.1-0 2>/dev/null | grep -q '^ii' && return 0
  dpkg -l libwebkit2gtk-4.0-37 2>/dev/null | grep -q '^ii' && return 0
  return 1
}

if ! _have_webkit; then
  echo "[AIME] WebKitGTK not found – attempting to install..."
  apt-get update -qq 2>/dev/null || true
  apt-get install -y --no-install-recommends libwebkit2gtk-4.1-0 2>/dev/null || \
  apt-get install -y --no-install-recommends libwebkit2gtk-4.0-37 2>/dev/null || \
  echo "[AIME] WARNING: Could not install WebKitGTK automatically. Please run:"
  echo "  sudo apt-get install libwebkit2gtk-4.1-0"
fi

# ── Ensure OpenGL ES / Mesa libraries are present ────────────────────────────
# Required by WebKitGTK for GPU-accelerated rendering (libGLESv2.so.2).
# Missing on fresh Crostini containers; fall back to software rendering Mesa.
_have_gles() {
  dpkg -l libgles2-mesa 2>/dev/null | grep -q '^ii' && return 0
  dpkg -l libgles2      2>/dev/null | grep -q '^ii' && return 0
  return 1
}

if ! _have_gles; then
  echo "[AIME] libGLESv2 not found – attempting to install Mesa GLES..."
  apt-get update -qq 2>/dev/null || true
  apt-get install -y --no-install-recommends libgles2-mesa libgl1-mesa-dri libgbm1 2>/dev/null || \
  apt-get install -y --no-install-recommends libgles2 libgl1-mesa-dri libgbm1 2>/dev/null || \
  echo "[AIME] WARNING: Could not install GLES libraries automatically. If the app crashes, run:"
  echo "  sudo apt-get install libgles2-mesa libgl1-mesa-dri"
fi

# ── MIME type registration ─────────────────────────────────────────────────────
mkdir -p /usr/share/mime/packages
cat > /usr/share/mime/packages/aimepack.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<mime-info xmlns="http://www.freedesktop.org/standards/shared-mime-info">
  <mime-type type="application/x-aimepack">
    <comment>AIME Lesson Pack</comment>
    <glob pattern="*.aimepack"/>
    <magic priority="60">
      <match type="string" value="PK" offset="0"/>
    </magic>
    <sub-class-of type="application/zip"/>
  </mime-type>
</mime-info>
EOF
update-mime-database /usr/share/mime || true
update-desktop-database || true
gtk-update-icon-cache -f -t /usr/share/icons/hicolor || true
