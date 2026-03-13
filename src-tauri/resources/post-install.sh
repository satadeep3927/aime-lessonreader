#!/bin/sh
update-mime-database /usr/share/mime || true
update-desktop-database || true
gtk-update-icon-cache -f -t /usr/share/icons/hicolor || true
