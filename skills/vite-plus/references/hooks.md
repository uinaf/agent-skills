# Commit Hooks

Use only when enabling, migrating, disabling, or removing Vite+ hook policy.

- Read the installed release's packaged hook documentation and `vp hooks` or
  equivalent help before changing state.
- Keep staged commands in the root Vite+ config and project-owned hook scripts
  in one repository directory.
- Generated dispatchers and shims belong to Vite+; project hook scripts and
  staged policy belong to the repository.
- An enable command may exit successfully while declining to replace a foreign
  or unsafe hooks path. Inspect status and effective Git config before claiming
  success.
- Disable local dispatch before removing shared project policy. Remove lifecycle
  setup, owned scripts, or staged config only when the repository no longer
  wants that behavior.
- Environment-variable suppression names are version-specific. Read them from
  the installed release rather than copying a newer name into an older repo.

Exercise one staged change when hooks remain enabled and confirm disabled hooks
do not silently reinstall through package lifecycle scripts.
