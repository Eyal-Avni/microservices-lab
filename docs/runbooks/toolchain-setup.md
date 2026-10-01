# Runbook: toolchain setup (Windows 11)

Run this once per machine before working on the lab. Each step is safe to re-run.

## 1. One-time machine settings

1. Remove any stale `GITHUB_TOKEN` user variable. It overrides your `gh` keyring login: `[Environment]::SetEnvironmentVariable('GITHUB_TOKEN',$null,'User')`.
2. As admin, enable long paths: set `HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem` → `LongPathsEnabled = 1`. Then run `git config --global core.longpaths true`.
3. As admin, put `%LOCALAPPDATA%\Microsoft\WinGet\Links` ahead of Docker Desktop's `resources\bin` in the machine PATH, so a current `kubectl` wins over Docker's older copy.
4. Give Docker's WSL VM enough memory. Create `%UserProfile%\.wslconfig` with `[wsl2]`, `memory=20GB`, `processors=16`, `swap=8GB`, then run `wsl --shutdown` and restart Docker Desktop.
5. Run `docker login`. Anonymous Docker Hub pulls are limited to 10 per hour.

## 2. Install the tools

- winget: `Microsoft.DotNet.SDK.10`, `Kubernetes.kubectl`, `Kubernetes.kind`, `Helm.Helm`, `Task.Task`, `bufbuild.buf`, `fullstorydev.grpcurl`, `Derailed.k9s`. Install each with `winget install --id <id> --exact`.
- Node 24 with nvm-windows: `nvm install 24.21.0`, then `nvm use 24.21.0`. Then pnpm: `npm install --global pnpm@12.8.1`.
- Tilt: download the Windows zip from the latest [Tilt release](https://github.com/tilt-dev/tilt/releases), check its SHA-256 against the release's `checksums.txt`, put `tilt.exe` in `%USERPROFILE%\bin` and add that folder to your user PATH. (The official `install.ps1` installs to the same folder but does not add it to PATH.)

## 3. Set up the repo

From `C:\microservices-lab`, run `task setup`. It points git at `.githooks`, sets `core.autocrlf=false` and runs `pnpm install`.

## 4. Verify

Check that each tool answers:

- `node --version`: v24.x
- `pnpm --version`: 12.x
- `dotnet --list-sdks`: shows a 10.x line
- `kubectl version --client`: v1.36 or newer, run from the WinGet Links folder
- `task --version`, `kind version`, `helm version --short`, `buf --version`, `tilt version`: each prints a version

From M1, `task doctor` runs these checks for you.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `gh auth status` shows "The token in GITHUB_TOKEN is invalid" | The variable is still in that window's environment. Open a new terminal (or restart VS Code). |
| `docker info` says it can't connect to `dockerDesktopLinuxEngine` | Docker Desktop isn't running (normal after `wsl --shutdown`). Start it and wait until the engine answers. |
| `kubectl` reports an old client version | Docker Desktop's copy wins on PATH. Redo step 1.3 and open a new terminal. |
| A tool you just installed is "not recognized" | New PATH entries reach only new processes. Restart the terminal or VS Code. |
| `nvm use` fails | It needs elevation to switch the Node symlink. Accept the UAC prompt, or run it in an admin terminal. |
