@echo off
echo Cleaning Next.js cache...
if exist .next (
    rmdir /s /q .next
    echo Cache cleaned.
)
echo Starting dev server...
npm run dev
