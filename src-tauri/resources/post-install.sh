#!/bin/sh
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
