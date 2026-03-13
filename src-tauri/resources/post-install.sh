#!/bin/sh
xdg-mime install --novendor /usr/share/doc/aime-lessonreader/aimepack.xml || true
update-mime-database /usr/share/mime || true
update-desktop-database || true
gtk-update-icon-cache -f -t /usr/share/icons/hicolor || true
