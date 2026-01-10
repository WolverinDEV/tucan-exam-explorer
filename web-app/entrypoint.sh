#!/bin/sh

# Run database migrations on container startup
pnpm db:migrate || exit 1
echo ""

# Launch the app
node build || exit 1