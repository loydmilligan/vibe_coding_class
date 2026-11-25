// Terminal Basecamp: course content.
//
// Shape: SECTIONS -> lessons -> { explain, code[], exercise }, plus one capstone per
// section. `where` on a code block tells Sarah which window to type it in.
// `solution` text is never shown on the page; it is sent to the help bot so it can
// climb from hints to a full walkthrough. Keep it accurate when you edit a lesson.
//
// Content strings are HTML. Avoid "${" inside template strings (it would be
// interpolated); plain $HOME and $USER are fine.

window.WHERE = {
  "powershell-admin": { label: "PowerShell (as administrator)", icon: "fa-windows", color: "sky", brand: true },
  powershell: { label: "PowerShell", icon: "fa-windows", color: "sky", brand: true },
  ubuntu: { label: "Ubuntu terminal", icon: "fa-linux", color: "orange", brand: true },
  explorer: { label: "File Explorer address bar", icon: "fa-folder-open", color: "yellow" },
  browser: { label: "Web browser address bar", icon: "fa-globe", color: "emerald" },
  codex: { label: "Codex prompt (type this to Codex)", icon: "fa-robot", color: "violet" },
  file: { label: "File contents (paste into nano)", icon: "fa-file-lines", color: "slate" },
};

window.SECTIONS = [
  // ------------------------------------------------------------------ 01
  {
    id: "wsl",
    title: "01. Linux Inside Windows (WSL)",
    color: "pink",
    icon: "fa-box-open",
    desc: "Install a real Linux system that lives inside your Windows PC.",
    intro: `<p>Developers mostly work in Linux. WSL (Windows Subsystem for Linux) lets you run Ubuntu, a popular kind of Linux, right inside Windows. No second computer, no wiping anything. You'll install it once and use it for everything after this.</p>`,
    lessons: [
      {
        id: "wsl-powershell",
        title: "Meet the terminal: PowerShell",
        explain: `<p>A <strong>terminal</strong> is a window where you type commands instead of clicking. Windows' own terminal language is <strong>PowerShell</strong>. Installing WSL needs <em>administrator</em> rights, so open it the special way:</p>
<ol><li>Press the <kbd>Windows</kbd> key and type <code>PowerShell</code>.</li><li>Right-click <strong>Windows PowerShell</strong> and choose <strong>Run as administrator</strong>. Say Yes to the pop-up.</li></ol>
<p>The line ending in <code>&gt;</code> is the <strong>prompt</strong>: it's waiting for you. Type a command and press <kbd>Enter</kbd>. <code>whoami</code> means "who am I logged in as?"</p>
<p class="tip">Pasting: click the copy icon on any code block here, then right-click inside the terminal (or press <kbd>Ctrl</kbd>+<kbd>V</kbd>) to paste.</p>`,
        code: [{ where: "powershell-admin", text: "whoami" }],
        exercise: {
          task: `Open PowerShell as administrator and run <code>whoami</code>.`,
          check: `It prints your computer's name, a backslash, and your Windows user name, like <code>laptop\\sarah</code>.`,
          solution: `Windows key, type PowerShell, right-click Windows PowerShell, Run as administrator, Yes. Then type whoami and press Enter. Output is COMPUTERNAME\\username.`,
        },
      },
      {
        id: "wsl-install",
        title: "wsl --install",
        explain: `<p>One command installs WSL and Ubuntu. <code>wsl</code> is the program, and <code>--install</code> is an <strong>option</strong> (also called a flag) that tells it what to do. Options usually start with <code>-</code> or <code>--</code>.</p>
<p>It downloads a few hundred MB, so give it some minutes. When it says so, <strong>restart your PC</strong>.</p>
<p class="tip">If it complains about "virtualization", ask the helper: it's a setting that sometimes needs turning on.</p>`,
        code: [{ where: "powershell-admin", text: "wsl --install" }],
        exercise: {
          task: `Run <code>wsl --install</code> in your administrator PowerShell, let it finish, then restart Windows.`,
          check: `After the restart, a window called <strong>Ubuntu</strong> opens by itself and asks for a new UNIX username. If it doesn't, open the Start menu and type <code>Ubuntu</code>.`,
          solution: `In admin PowerShell: wsl --install. Wait for "The requested operation is successful" or similar, restart Windows. Ubuntu opens after restart; if not, start "Ubuntu" from the Start menu. If error 0x80370102 or virtualization message: enable virtualization (VT-x/SVM) in BIOS/UEFI and the "Virtual Machine Platform" Windows feature.`,
        },
      },
      {
        id: "wsl-account",
        title: "Create your Linux account",
        explain: `<p>Your Linux system has its own user account, separate from Windows. Ubuntu asks you to make one the first time it opens:</p>
<ul><li><strong>Username:</strong> all lowercase, no spaces, like <code>sarah</code>.</li><li><strong>Password:</strong> when you type it, <strong>nothing appears on screen</strong>. No dots, no stars. That's normal Linux behaviour: just type it and press <kbd>Enter</kbd>.</li></ul>
<p>Write the password down somewhere safe. You'll need it every time you do admin work in Linux.</p>
<p>If you closed the Ubuntu window, this command in PowerShell opens it again:</p>`,
        code: [{ where: "powershell", text: "wsl -d Ubuntu" }],
        exercise: {
          task: `Finish Ubuntu's first-time setup: pick a username and a password.`,
          check: `You see a green-and-blue prompt ending in <code>$</code>, something like <code>sarah@laptop:~$</code>.`,
          solution: `When asked "Enter new UNIX username", type a lowercase name, Enter. Type a password (invisible), Enter, retype it, Enter. Prompt then shows username@computer:~$. If the window closed early, run wsl -d Ubuntu in PowerShell. If it skipped account creation and logs in as root, ask for help: the fix is creating a user with adduser.`,
        },
      },
      {
        id: "wsl-list",
        title: "wsl -l -v",
        explain: `<p><code>wsl -l -v</code> lists the Linux systems you have (<code>-l</code> for list) with details (<code>-v</code> for verbose, meaning "tell me more"). Most commands have short options like these. You can usually combine several.</p>
<p>You want to see <strong>Ubuntu</strong> with <strong>VERSION 2</strong>. Version 2 is the modern, fast one.</p>`,
        code: [{ where: "powershell", text: "wsl -l -v" }],
        exercise: {
          task: `In PowerShell, list your Linux systems and find Ubuntu's version.`,
          check: `A small table with <code>Ubuntu</code>, a STATE (Running or Stopped) and VERSION <code>2</code>.`,
          solution: `Run wsl -l -v in PowerShell (admin not needed). If VERSION shows 1, run wsl --set-version Ubuntu 2.`,
        },
      },
    ],
    capstone: {
      id: "wsl-capstone",
      title: "Set up Windows Terminal as home base",
      task: `<p><strong>Windows Terminal</strong> holds PowerShell and Ubuntu in tabs, side by side. It's built into Windows 11 (on Windows 10, install it free from the Microsoft Store).</p>
<ol><li>Open <strong>Terminal</strong> from the Start menu.</li><li>Click the small <strong>⌄</strong> next to the tabs and open an <strong>Ubuntu</strong> tab.</li><li>In Terminal's <strong>Settings → Startup → Default profile</strong>, pick <strong>Ubuntu</strong> and save.</li><li>In the Ubuntu tab, run <code>whoami</code>.</li><li>Open a PowerShell tab too and run <code>wsl -l -v</code>.</li></ol>`,
      check: `<code>whoami</code> in Ubuntu shows your <em>Linux</em> username, and a new Terminal window now opens straight into Ubuntu.`,
      solution: `Start menu > Terminal. Dropdown arrow next to the + tab > Ubuntu. Settings (Ctrl+,) > Startup > Default profile = Ubuntu > Save. In Ubuntu tab: whoami prints the Linux username. In a PowerShell tab: wsl -l -v shows Ubuntu version 2.`,
    },
  },

  // ------------------------------------------------------------------ 02
  {
    id: "nav",
    title: "02. Finding Your Way Around",
    color: "violet",
    icon: "fa-compass",
    desc: "Where am I, what's here, how do I get there: pwd, ls, cd, mkdir.",
    intro: `<p>Linux keeps everything in one big tree of folders (also called <strong>directories</strong>), starting at <code>/</code>, the "root". Your own stuff lives in your <strong>home folder</strong>: <code>/home/yourname</code>, nicknamed <code>~</code> (tilde). From now on, everything happens in your <strong>Ubuntu</strong> tab unless a lesson says otherwise.</p>`,
    lessons: [
      {
        id: "nav-pwd",
        title: "pwd: where am I?",
        explain: `<p><code>pwd</code> means <strong>p</strong>rint <strong>w</strong>orking <strong>d</strong>irectory: the folder you're standing in right now. The terminal is always "in" some folder, the way File Explorer always shows one folder.</p>
<p>Notice the prompt shows <code>~</code> too. That's your home folder.</p>`,
        code: [{ where: "ubuntu", text: "pwd" }],
        exercise: {
          task: `Run <code>pwd</code> in a fresh Ubuntu tab.`,
          check: `It prints <code>/home/</code> followed by your Linux username.`,
          solution: `pwd prints /home/<username>, which is the home folder ~.`,
        },
      },
      {
        id: "nav-ls",
        title: "ls: what's in here?",
        explain: `<p><code>ls</code> <strong>l</strong>i<strong>s</strong>ts what's in the current folder. Your home is nearly empty right now, so try the options:</p>
<ul><li><code>ls -l</code>: long format, one item per line with size and date.</li><li><code>ls -a</code>: show <em>all</em>, including hidden files. Hidden files start with a dot, like <code>.bashrc</code>.</li><li><code>ls -la</code>: both at once.</li><li><code>ls /</code>: list a different folder without going there.</li></ul>`,
        code: [
          { where: "ubuntu", text: "ls -la" },
          { where: "ubuntu", text: "ls /" },
        ],
        exercise: {
          task: `Use <code>ls</code> with the right options to find the hidden file called <code>.bashrc</code> in your home folder.`,
          check: `You can see <code>.bashrc</code> in the list. (You'll edit it in section 06.)`,
          solution: `ls -la (or ls -a) in the home folder shows .bashrc, .profile, .bash_logout and . and .. entries. Plain ls shows nothing because they are hidden.`,
        },
      },
      {
        id: "nav-cd",
        title: "cd: go somewhere",
        explain: `<p><code>cd</code> <strong>c</strong>hanges <strong>d</strong>irectory. A few shortcuts are worth learning now:</p>
<ul><li><code>cd /etc</code>: go to an exact place (a path starting with <code>/</code> is an <strong>absolute path</strong>).</li><li><code>cd ..</code>: go up one folder. <code>..</code> always means "the folder above".</li><li><code>cd ~</code> or just <code>cd</code>: go home from anywhere.</li><li><code>cd -</code>: go back to where you just were.</li></ul>
<p class="tip">Press <kbd>Tab</kbd> while typing a folder name and the terminal finishes it for you. Press <kbd>↑</kbd> to bring back earlier commands. These two keys save hours.</p>`,
        code: [
          { where: "ubuntu", text: "cd /etc" },
          { where: "ubuntu", text: "cd ~" },
        ],
        exercise: {
          task: `Go to <code>/etc</code>, list what's there, go up one level with <code>..</code>, then come home. Use <code>pwd</code> to check where you are after each move.`,
          check: `<code>pwd</code> shows <code>/etc</code>, then <code>/</code>, then <code>/home/yourname</code>.`,
          solution: `cd /etc ; pwd -> /etc ; ls ; cd .. ; pwd -> / ; cd ~ ; pwd -> /home/<user>.`,
        },
      },
      {
        id: "nav-mkdir",
        title: "mkdir: make a folder",
        explain: `<p><code>mkdir</code> <strong>m</strong>a<strong>k</strong>es a <strong>dir</strong>ectory. Your projects will live in <code>~/projects</code>, so make that now.</p>
<p>Add <code>-p</code> to make several levels at once (and to not complain if a folder already exists): <code>mkdir -p ~/projects/playground/notes</code> makes all three in one go.</p>
<p class="tip">Avoid spaces in folder names (use <code>-</code> or <code>_</code>). Spaces work, but you'd have to wrap every path in quotes.</p>`,
        code: [{ where: "ubuntu", text: "mkdir ~/projects" }],
        exercise: {
          task: `Create the folder <code>~/projects</code>, then go into it with <code>cd</code>.`,
          check: `<code>pwd</code> prints <code>/home/yourname/projects</code>.`,
          solution: `mkdir ~/projects ; cd ~/projects ; pwd. If "File exists", it's already made: just cd into it.`,
        },
      },
    ],
    capstone: {
      id: "nav-capstone",
      title: "Lay out your projects folder",
      task: `<p>Build this layout inside your home folder. You'll use every piece later in the course:</p>
<pre class="tree">~/projects
├── sysops-agent
└── playground
    ├── notes
    └── scratch</pre>
<p>Then, using only <strong>relative</strong> moves (<code>cd ..</code>, <code>cd notes</code>, no paths starting with <code>/</code> or <code>~</code>), walk from <code>notes</code> to <code>scratch</code>. Finally, run <code>ls -R ~/projects</code> (<code>-R</code> means "and everything inside, recursively") to see the whole tree.</p>`,
      check: `<code>ls -R ~/projects</code> lists <code>playground</code> and <code>sysops-agent</code>, then <code>notes</code> and <code>scratch</code> under playground.`,
      solution: `mkdir -p ~/projects/sysops-agent ~/projects/playground/notes ~/projects/playground/scratch ; cd ~/projects/playground/notes ; cd ../scratch ; pwd ; ls -R ~/projects.`,
    },
  },

  // ------------------------------------------------------------------ 03
  {
    id: "files",
    title: "03. Files: Make, Copy, Move, Delete",
    color: "sky",
    icon: "fa-copy",
    desc: "touch, cp, mv, rm and cat: the everyday file tools.",
    intro: `<p>Everything you do with files in File Explorer (new, copy, rename, delete) has a short command. Do this section inside <code>~/projects/playground</code>, where mistakes don't matter.</p>`,
    lessons: [
      {
        id: "files-touch",
        title: "touch: make an empty file",
        explain: `<p><code>touch</code> creates an empty file (or updates the date on one that exists). You can name several files at once, separated by spaces.</p>`,
        code: [
          { where: "ubuntu", text: "cd ~/projects/playground" },
          { where: "ubuntu", text: "touch hello.txt" },
        ],
        exercise: {
          task: `In <code>~/projects/playground</code>, create three files in one command: <code>a.txt</code>, <code>b.txt</code> and <code>c.txt</code>.`,
          check: `<code>ls</code> shows <code>a.txt  b.txt  c.txt  hello.txt  notes  scratch</code>.`,
          solution: `cd ~/projects/playground ; touch a.txt b.txt c.txt ; ls.`,
        },
      },
      {
        id: "files-cat",
        title: "cat: read a file",
        explain: `<p><code>cat</code> prints a file's contents to the screen. It's the quickest way to peek inside a small text file. Your files are empty, so try it on a system file that has something in it:</p>
<p class="tip">For long files, <code>less filename</code> lets you scroll; press <kbd>q</kbd> to quit.</p>`,
        code: [{ where: "ubuntu", text: "cat /etc/os-release" }],
        exercise: {
          task: `Use <code>cat</code> to find out which version of Ubuntu you have.`,
          check: `You see lines like <code>PRETTY_NAME="Ubuntu 24.04 LTS"</code> (your number may differ).`,
          solution: `cat /etc/os-release and read PRETTY_NAME or VERSION.`,
        },
      },
      {
        id: "files-cp",
        title: "cp: copy",
        explain: `<p><code>cp</code> <strong>c</strong>o<strong>p</strong>ies. The pattern is <code>cp FROM TO</code>.</p>
<ul><li><code>cp a.txt a-copy.txt</code>: copy a file under a new name.</li><li><code>cp a.txt notes/</code>: copy a file into a folder (keeps the name).</li><li><code>cp -r notes notes-backup</code>: copy a whole folder. <code>-r</code> (recursive) is required for folders.</li></ul>
<p class="tip">Careful: if the target file already exists, <code>cp</code> overwrites it without asking. Add <code>-i</code> to be asked first.</p>`,
        code: [{ where: "ubuntu", text: "cp a.txt notes/" }],
        exercise: {
          task: `Copy <code>b.txt</code> into the <code>scratch</code> folder, then make a copy of the whole <code>scratch</code> folder called <code>scratch-backup</code>.`,
          check: `<code>ls -R</code> shows <code>b.txt</code> in both <code>scratch</code> and <code>scratch-backup</code>.`,
          solution: `cp b.txt scratch/ ; cp -r scratch scratch-backup ; ls -R.`,
        },
      },
      {
        id: "files-mv",
        title: "mv: move or rename",
        explain: `<p><code>mv</code> <strong>m</strong>o<strong>v</strong>es. It's also how you <strong>rename</strong>: moving a file to a new name in the same folder is a rename.</p>
<ul><li><code>mv hello.txt welcome.txt</code>: rename.</li><li><code>mv welcome.txt notes/</code>: move into a folder.</li><li><code>mv notes/welcome.txt .</code>: move back here. A single <code>.</code> means "this folder".</li></ul>`,
        code: [{ where: "ubuntu", text: "mv hello.txt welcome.txt" }],
        exercise: {
          task: `Rename <code>c.txt</code> to <code>ideas.txt</code> and move it into <code>notes</code>, in one command.`,
          check: `<code>ls notes</code> shows <code>ideas.txt</code> and <code>c.txt</code> is gone from playground.`,
          solution: `mv c.txt notes/ideas.txt ; ls notes.`,
        },
      },
      {
        id: "files-rm",
        title: "rm: delete",
        explain: `<p><code>rm</code> <strong>r</strong>e<strong>m</strong>oves files. <strong>There is no Recycle Bin.</strong> Deleted means gone.</p>
<ul><li><code>rm a.txt</code>: delete a file.</li><li><code>rm -i a.txt</code>: ask "are you sure?" first. Good habit while learning.</li><li><code>rm -r scratch-backup</code>: delete a folder and everything inside it.</li></ul>
<p class="warn">You'll see <code>rm -rf</code> online. It deletes everything it's pointed at without asking. Read the path twice before you ever press Enter on it.</p>`,
        code: [{ where: "ubuntu", text: "rm -i a.txt" }],
        exercise: {
          task: `Delete <code>a.txt</code> using the "ask me first" option, then delete the <code>scratch-backup</code> folder.`,
          check: `<code>ls</code> no longer shows <code>a.txt</code> or <code>scratch-backup</code>.`,
          solution: `rm -i a.txt then type y and Enter ; rm -r scratch-backup ; ls.`,
        },
      },
    ],
    capstone: {
      id: "files-capstone",
      title: "Tidy the playground",
      task: `<p>Starting in <code>~/projects/playground</code>, end up with exactly this, using <code>touch</code>, <code>cp</code>, <code>mv</code> and <code>rm</code>:</p>
<pre class="tree">playground
├── notes
│   ├── ideas.txt
│   └── todo.txt
├── scratch
│   └── draft.txt
└── welcome.txt</pre>
<p>Rules: <code>draft.txt</code> must be made by copying another file, not with <code>touch</code>. Any other files or folders in playground should be deleted. Check your work with <code>ls -R</code>, and use <code>cat</code> on one file to confirm it opens.</p>`,
      check: `<code>ls -R</code> matches the tree above exactly.`,
      solution: `From ~/projects/playground: touch notes/todo.txt ; cp b.txt scratch/draft.txt (or copy any file) ; rm b.txt scratch/b.txt ; make sure welcome.txt exists (touch welcome.txt if hello.txt was not renamed) ; remove any leftovers with rm or rm -r ; ls -R to compare.`,
    },
  },

  // ------------------------------------------------------------------ 04
  {
    id: "bridge",
    title: "04. Windows ↔ Linux Bridge",
    color: "emerald",
    icon: "fa-right-left",
    desc: "See your Linux files from Windows, and your Windows files from Linux.",
    intro: `<p>Windows and your Ubuntu system can see each other's files. This section shows both directions, and one rule: <strong>keep your projects on the Linux side</strong> (in <code>~/projects</code>). Tools like Codex and Docker run much faster there, and some break on the Windows side.</p>`,
    lessons: [
      {
        id: "bridge-explorer",
        title: "explorer.exe .",
        explain: `<p>From Ubuntu you can start Windows programs. <code>explorer.exe .</code> opens File Explorer showing the folder you're in. (Remember, <code>.</code> means "this folder".)</p>`,
        code: [
          { where: "ubuntu", text: "cd ~/projects/playground" },
          { where: "ubuntu", text: "explorer.exe ." },
        ],
        exercise: {
          task: `Open your <code>playground</code> folder in File Explorer from the terminal.`,
          check: `A File Explorer window shows <code>notes</code>, <code>scratch</code> and <code>welcome.txt</code>, and its address bar starts with <code>\\\\wsl.localhost\\Ubuntu</code>.`,
          solution: `cd ~/projects/playground ; explorer.exe . (the dot matters).`,
        },
      },
      {
        id: "bridge-wslpath",
        title: "Linux files from File Explorer",
        explain: `<p>Your whole Linux system appears in File Explorer under <strong>Linux</strong> in the left sidebar. You can also type its address. Replace <code>yourname</code> with your Linux username:</p>
<p class="tip">Right-click your <code>projects</code> folder in File Explorer and choose <strong>Pin to Quick access</strong>, so it's always one click away.</p>`,
        code: [{ where: "explorer", text: "\\\\wsl.localhost\\Ubuntu\\home\\yourname\\projects" }],
        exercise: {
          task: `In File Explorer (not the terminal), open your projects folder by typing its address, and pin it to Quick access. Then, still in File Explorer, make a new text file in <code>playground</code> called <code>from-windows.txt</code>.`,
          check: `Back in Ubuntu, <code>ls ~/projects/playground</code> shows <code>from-windows.txt</code>.`,
          solution: `Address bar: \\\\wsl.localhost\\Ubuntu\\home\\<linuxname>\\projects. Right-click projects > Pin to Quick access. In playground: right-click > New > Text Document, name it from-windows.txt (if file extensions are hidden, Windows may add .txt twice; check in the terminal with ls). Then ls ~/projects/playground in Ubuntu.`,
        },
      },
      {
        id: "bridge-mnt",
        title: "Windows files from Linux: /mnt/c",
        explain: `<p>Going the other way, your Windows <code>C:</code> drive shows up in Linux at <code>/mnt/c</code>. Your Windows user folder is <code>/mnt/c/Users/YourWindowsName</code>. Your Windows name may differ from your Linux name, so list the folder to find it:</p>`,
        code: [{ where: "ubuntu", text: "ls /mnt/c/Users" }],
        exercise: {
          task: `Find your Windows user folder, then list your Windows <strong>Downloads</strong> folder from Ubuntu.`,
          check: `You see the same files that File Explorer shows in Downloads.`,
          solution: `ls /mnt/c/Users shows folders like Public, Default and the user's own folder name. Then ls /mnt/c/Users/<WindowsName>/Downloads. If the name has a space, wrap the path in quotes: ls "/mnt/c/Users/Sarah Black/Downloads". Tab completion handles spaces automatically.`,
        },
      },
      {
        id: "bridge-copy",
        title: "Bring a Windows file into Linux",
        explain: `<p>Copying across is just <code>cp</code> with a <code>/mnt/c</code> path on one side. Replace <code>YourWindowsName</code> and the file name with real ones (Tab completion helps). If a name has spaces, wrap the whole path in quotes.</p>`,
        code: [{ where: "ubuntu", text: "cp /mnt/c/Users/YourWindowsName/Downloads/some-file.pdf ~/projects/playground/" }],
        exercise: {
          task: `Pick any small file in your Windows Downloads folder and copy it into <code>~/projects/playground</code>.`,
          check: `<code>ls ~/projects/playground</code> shows the file, and it's still in Windows Downloads too.`,
          solution: `cp "/mnt/c/Users/<WindowsName>/Downloads/<file>" ~/projects/playground/ ; ls ~/projects/playground.`,
        },
      },
    ],
    capstone: {
      id: "bridge-capstone",
      title: "A round trip",
      task: `<ol><li>In Windows, save any picture from the web into your Downloads folder.</li><li>From Ubuntu, copy it into <code>~/projects/playground/notes</code> and rename it to <code>pic.jpg</code> (or <code>.png</code>, keep its real ending) using <code>mv</code>.</li><li>Open that folder in File Explorer from the terminal and double-click the picture to view it.</li><li>Delete <code>from-windows.txt</code> from the terminal and watch it vanish in File Explorer (press <kbd>F5</kbd> to refresh).</li></ol>`,
      check: `The picture opens in Windows from your Linux folder, and <code>from-windows.txt</code> is gone on both sides.`,
      solution: `cp "/mnt/c/Users/<WindowsName>/Downloads/<image>" ~/projects/playground/notes/ ; cd ~/projects/playground/notes ; mv <image> pic.jpg ; explorer.exe . ; double-click ; rm ~/projects/playground/from-windows.txt (or from-windows.txt.txt) ; F5 in Explorer.`,
    },
  },

  // ------------------------------------------------------------------ 05
  {
    id: "admin",
    title: "05. Admin Powers: sudo, Updates, Apps, nano",
    color: "amber",
    icon: "fa-user-shield",
    desc: "Keep the system updated, install programs and edit text files.",
    intro: `<p>Linux installs programs from a trusted catalogue with one command, no websites or installers. Some actions need admin rights, which is what <code>sudo</code> is for.</p>`,
    lessons: [
      {
        id: "admin-sudo",
        title: "sudo: do this as admin",
        explain: `<p>Putting <code>sudo</code> in front of a command runs it as the administrator (called <strong>root</strong>). It asks for <strong>your Linux password</strong>, the one you made in section 01. Typing is invisible, as before.</p>
<p>Use <code>sudo</code> only when a command needs it, usually when you see <code>Permission denied</code>. Root can break anything, so read before you press Enter.</p>`,
        code: [{ where: "ubuntu", text: "sudo whoami" }],
        exercise: {
          task: `Run <code>whoami</code>, then <code>sudo whoami</code>, and compare.`,
          check: `The first prints your username; the <code>sudo</code> one prints <code>root</code>.`,
          solution: `whoami -> username ; sudo whoami -> asks password -> root. If "incorrect password", retype carefully (it's invisible). If she forgot it: in PowerShell, wsl -u root, then passwd <username> to set a new one.`,
        },
      },
      {
        id: "admin-update",
        title: "apt update",
        explain: `<p><code>apt</code> is Ubuntu's app store for the terminal. <code>apt update</code> doesn't install anything: it refreshes the <em>list</em> of what's available and what has newer versions. Always run it first.</p>`,
        code: [{ where: "ubuntu", text: "sudo apt update" }],
        exercise: {
          task: `Refresh the package list.`,
          check: `It ends with something like <code>42 packages can be upgraded</code> or <code>All packages are up to date</code>.`,
          solution: `sudo apt update ; enter password if asked. Needs internet. "Could not resolve" means a network/DNS issue: try wsl --shutdown in PowerShell and reopen Ubuntu.`,
        },
      },
      {
        id: "admin-upgrade",
        title: "apt upgrade",
        explain: `<p><code>apt upgrade</code> installs the newer versions that <code>update</code> found. It will ask <code>Do you want to continue? [Y/n]</code>; press <kbd>Y</kbd> then <kbd>Enter</kbd>.</p>
<p>You can chain both with <code>&amp;&amp;</code>, which means "and if that worked, then do this". <code>-y</code> answers yes for you.</p>`,
        code: [{ where: "ubuntu", text: "sudo apt update && sudo apt upgrade -y" }],
        exercise: {
          task: `Bring your whole system up to date with one line.`,
          check: `It finishes back at the prompt with no red <code>E:</code> error lines. Running it again says <code>0 upgraded</code>.`,
          solution: `sudo apt update && sudo apt upgrade -y. If "Could not get lock", another apt is running: wait a minute and retry.`,
        },
      },
      {
        id: "admin-install",
        title: "apt install",
        explain: `<p><code>sudo apt install NAME</code> installs programs. You can list several. Three useful ones to start:</p>
<ul><li><code>tree</code>: draws folders as a tree.</li><li><code>htop</code>: a live view of what your computer is doing (press <kbd>q</kbd> to quit).</li><li><code>curl</code> and <code>git</code>: you'll need these for Codex.</li></ul>`,
        code: [{ where: "ubuntu", text: "sudo apt install -y tree htop curl git" }],
        exercise: {
          task: `Install the four programs, then run <code>tree ~/projects</code>.`,
          check: `You see your projects folder drawn as a tree, like the picture in section 02.`,
          solution: `sudo apt install -y tree htop curl git ; tree ~/projects. If "Unable to locate package", run sudo apt update first.`,
        },
      },
      {
        id: "admin-nano",
        title: "nano: edit a file",
        explain: `<p><code>nano</code> is a simple text editor that runs in the terminal. Open (or create) a file by naming it. Then just type. The shortcuts are listed at the bottom; <code>^</code> means <kbd>Ctrl</kbd>:</p>
<ul><li><kbd>Ctrl</kbd>+<kbd>O</kbd> then <kbd>Enter</kbd>: save ("write Out").</li><li><kbd>Ctrl</kbd>+<kbd>X</kbd>: exit. If you haven't saved, it asks; press <kbd>Y</kbd> then <kbd>Enter</kbd>.</li><li>The mouse doesn't move the cursor; use the arrow keys. Paste with right-click.</li></ul>`,
        code: [{ where: "ubuntu", text: "nano ~/projects/playground/notes/todo.txt" }],
        exercise: {
          task: `Open <code>todo.txt</code> in nano, write three things you want to learn, save and exit.`,
          check: `<code>cat ~/projects/playground/notes/todo.txt</code> shows your three lines.`,
          solution: `nano ~/projects/playground/notes/todo.txt ; type lines ; Ctrl+O, Enter ; Ctrl+X ; cat the file.`,
        },
      },
    ],
    capstone: {
      id: "admin-capstone",
      title: "Start a setup log",
      task: `<p>Keep a record of how your machine is set up. It'll be useful later, and Codex will read it.</p>
<ol><li>Update and upgrade the system in one line.</li><li>Install <code>jq</code> (a tool for reading data; you'll use it in section 10).</li><li>Create <code>~/projects/playground/notes/setup-log.md</code> in nano with today's date and a line for each program you've installed so far.</li><li>Show the file with <code>cat</code>, and the whole projects tree with <code>tree</code>.</li></ol>`,
      check: `<code>cat</code> shows your log, <code>jq --version</code> prints a version, and <code>tree ~/projects</code> includes <code>setup-log.md</code>.`,
      solution: `sudo apt update && sudo apt upgrade -y ; sudo apt install -y jq ; nano ~/projects/playground/notes/setup-log.md (write date and installed: tree, htop, curl, git, jq), Ctrl+O Enter Ctrl+X ; cat ~/projects/playground/notes/setup-log.md ; jq --version ; tree ~/projects.`,
    },
  },

  // ------------------------------------------------------------------ 06
  {
    id: "shell",
    title: "06. Make the Shell Yours",
    color: "rose",
    icon: "fa-wand-magic-sparkles",
    desc: "echo, variables, aliases and .bashrc: shortcuts that stick.",
    intro: `<p>The program reading your commands is called the <strong>shell</strong>; Ubuntu's is <strong>bash</strong>. You can teach it shortcuts and settings that load every time you open a terminal.</p>`,
    lessons: [
      {
        id: "shell-echo",
        title: "echo, > and >>",
        explain: `<p><code>echo</code> prints whatever you give it. On its own that's dull; it gets useful with <strong>redirection</strong>:</p>
<ul><li><code>echo "hi" &gt; file.txt</code>: write into a file, <strong>replacing</strong> what was there.</li><li><code>echo "hi" &gt;&gt; file.txt</code>: <strong>add</strong> a line to the end.</li></ul>
<p class="warn">One <code>&gt;</code> wipes the file first. When adding to an existing file, always use two.</p>`,
        code: [{ where: "ubuntu", text: 'echo "Installed tree, htop, curl, git, jq" >> ~/projects/playground/notes/setup-log.md' }],
        exercise: {
          task: `Without opening nano, add a line to <code>setup-log.md</code> that says you finished section 05.`,
          check: `<code>cat</code> on the log shows your old lines plus the new one at the bottom.`,
          solution: `echo "Finished section 05" >> ~/projects/playground/notes/setup-log.md ; cat it. If she used a single > the old content is gone; rewrite it in nano.`,
        },
      },
      {
        id: "shell-vars",
        title: "Variables",
        explain: `<p>A <strong>variable</strong> is a name that holds a value. Set it with <code>NAME=value</code> (<strong>no spaces</strong> around <code>=</code>), and use it with a <code>$</code> in front.</p>
<p>Linux already has some: <code>$HOME</code> (your home folder), <code>$USER</code> (your username), <code>$PATH</code> (where the shell looks for programs).</p>
<p><code>export</code> makes a variable visible to programs you start, not just the shell. You'll use that for your API key later.</p>`,
        code: [
          { where: "ubuntu", text: 'GREETING="Hello"\necho "$GREETING, $USER. Home is $HOME"' },
          { where: "ubuntu", text: 'export PROJECTS="$HOME/projects"\ncd "$PROJECTS"' },
        ],
        exercise: {
          task: `Make a variable called <code>PLAY</code> that holds the path to your playground folder, then use it with <code>cd</code> and <code>ls</code>.`,
          check: `<code>cd "$PLAY"</code> takes you to <code>~/projects/playground</code>. Note: close the tab and it's forgotten. The next lessons fix that.`,
          solution: `PLAY="$HOME/projects/playground" ; cd "$PLAY" ; ls "$PLAY". Common error: spaces around = ("PLAY: command not found").`,
        },
      },
      {
        id: "shell-alias",
        title: "alias: your own shortcuts",
        explain: `<p>An <strong>alias</strong> is a nickname for a longer command. Type <code>alias</code> on its own to see the ones Ubuntu already gives you (like <code>ll</code>).</p>`,
        code: [
          { where: "ubuntu", text: "alias proj='cd ~/projects'" },
          { where: "ubuntu", text: "alias" },
        ],
        exercise: {
          task: `Make an alias called <code>play</code> that goes straight to your playground folder, and try it from somewhere else (like <code>/etc</code>).`,
          check: `Typing <code>play</code> then <code>pwd</code> shows <code>/home/yourname/projects/playground</code>.`,
          solution: `alias play='cd ~/projects/playground' ; cd /etc ; play ; pwd. Single quotes, no spaces around =.`,
        },
      },
      {
        id: "shell-bashrc",
        title: ".bashrc and source",
        explain: `<p><code>~/.bashrc</code> is the hidden file bash reads <strong>every time a terminal opens</strong>. Anything you put at the bottom (variables, aliases) is set up for you automatically.</p>
<ol><li>Back it up first: <code>cp ~/.bashrc ~/.bashrc.backup</code>. If you break something, copy it back.</li><li>Open it in nano and press <kbd>Ctrl</kbd>+<kbd>End</kbd> (or <kbd>Ctrl</kbd>+<kbd>W</kbd>, <kbd>Ctrl</kbd>+<kbd>V</kbd>) to jump to the bottom.</li><li>Add your lines, save, exit.</li><li><code>source ~/.bashrc</code> reloads it in the tab you're in (new tabs load it themselves).</li></ol>`,
        code: [
          { where: "ubuntu", text: "cp ~/.bashrc ~/.bashrc.backup" },
          { where: "ubuntu", text: "nano ~/.bashrc" },
          { where: "ubuntu", text: "source ~/.bashrc" },
        ],
        exercise: {
          task: `Back up your <code>.bashrc</code>, then add your <code>proj</code> and <code>play</code> aliases to the bottom of it and reload it.`,
          check: `Open a brand-new Ubuntu tab and <code>play</code> still works.`,
          solution: `cp ~/.bashrc ~/.bashrc.backup ; nano ~/.bashrc ; at the end add: alias proj='cd ~/projects' and alias play='cd ~/projects/playground' ; Ctrl+O Enter Ctrl+X ; source ~/.bashrc ; open a new tab ; play.`,
        },
      },
    ],
    capstone: {
      id: "shell-capstone",
      title: "Personalise your terminal",
      task: `<p>Add a block like this to the bottom of <code>~/.bashrc</code> (write it yourself; don't paste blind), then reload:</p>
<ul><li>A variable <code>PROJECTS</code> set to your projects folder, with <code>export</code>.</li><li>Aliases <code>proj</code> and <code>play</code> that use <code>$PROJECTS</code>.</li><li>An alias <code>update</code> that updates and upgrades the system in one go.</li><li>An <code>echo</code> line that greets you by name when a terminal opens.</li></ul>
<p>Then open a new tab, see your greeting, and run <code>update</code>.</p>`,
      check: `A new tab greets you, <code>echo $PROJECTS</code> prints your projects path, and <code>update</code> runs apt.`,
      solution: `At the end of ~/.bashrc:
# my settings
export PROJECTS="$HOME/projects"
alias proj='cd "$PROJECTS"'
alias play='cd "$PROJECTS/playground"'
alias update='sudo apt update && sudo apt upgrade -y'
echo "Hi Sarah, ready to build something?"
Save, source ~/.bashrc, open new tab. If a typo breaks the terminal: cp ~/.bashrc.backup ~/.bashrc.`,
    },
  },

  // ------------------------------------------------------------------ 07
  {
    id: "codex",
    title: "07. Install Codex",
    color: "violet",
    icon: "fa-robot",
    desc: "Get OpenAI's coding agent running in your terminal with your ChatGPT account.",
    intro: `<p><strong>Codex</strong> is an AI agent that works in your terminal. Unlike ChatGPT in a browser, it can read your files and run commands, so it can actually <em>do</em> things, and it asks before doing anything risky. It comes with your ChatGPT Plus plan. From here on you'll use it constantly, so every section from now has Codex in it.</p>
<p class="tip">OpenAI's docs say Codex can also run natively on Windows. You're using it in WSL because that's where your projects and Linux tools live.</p>`,
    lessons: [
      {
        id: "codex-install",
        title: "curl | sh: run an installer",
        explain: `<p>Codex installs with one line. Read it before running it:</p>
<ul><li><code>curl -fsSL URL</code> downloads a file and prints it (the letters mean: fail on errors, quiet, show errors, follow redirects).</li><li><code>|</code> is a <strong>pipe</strong>: it feeds one command's output into the next.</li><li><code>sh</code> runs what it receives as a script.</li></ul>
<p class="warn">So this line runs a script from the internet. Only ever do that with a source you trust: here it's OpenAI's own address from their official install docs.</p>`,
        code: [{ where: "ubuntu", text: "curl -fsSL https://chatgpt.com/codex/install.sh | sh" }],
        exercise: {
          task: `Install Codex, then open a new Ubuntu tab (so your shell notices the new program).`,
          check: `The installer finishes without red errors and says where it put <code>codex</code>.`,
          solution: `curl -fsSL https://chatgpt.com/codex/install.sh | sh ; then open a new tab or source ~/.bashrc. If curl is missing: sudo apt install -y curl. Alternative install if the script fails: install Node.js and run npm install -g @openai/codex.`,
        },
      },
      {
        id: "codex-version",
        title: "codex --version and which",
        explain: `<p>Two ways to check a program is installed:</p>
<ul><li><code>codex --version</code>: most programs answer <code>--version</code>.</li><li><code>which codex</code>: shows <em>where</em> the program file lives. If it prints nothing, the shell can't find it (usually: open a new tab).</li></ul>`,
        code: [{ where: "ubuntu", text: "codex --version\nwhich codex" }],
        exercise: {
          task: `Check Codex is installed and find where it lives.`,
          check: `You see a version like <code>codex-cli 0.172.0</code> and a path.`,
          solution: `codex --version ; which codex. "command not found": open a new tab or run source ~/.bashrc; if still missing, the installer printed a folder to add to PATH: echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc then source ~/.bashrc (check the folder the installer named).`,
        },
      },
      {
        id: "codex-login",
        title: "codex login",
        explain: `<p>Sign Codex in to your ChatGPT account. It prints a link and usually opens your Windows browser. Sign in there, then come back to the terminal.</p>
<p>If the browser page never finishes, use the <strong>device code</strong> way instead: Codex shows a short code and a web address; you open the address in any browser, sign in and type the code.</p>
<p>Check it worked with <code>codex login status</code>.</p>
<p class="warn">Never paste your ChatGPT password into the terminal, and never paste the device code anywhere except OpenAI's page.</p>`,
        code: [
          { where: "ubuntu", text: "codex login" },
          { where: "ubuntu", text: "codex login --device-auth" },
          { where: "ubuntu", text: "codex login status" },
        ],
        exercise: {
          task: `Sign Codex in with your ChatGPT Plus account.`,
          check: `<code>codex login status</code> says you're logged in with ChatGPT.`,
          solution: `codex login, sign in with ChatGPT in the browser. If the browser doesn't open, copy the printed link into a Windows browser. If the redirect back to localhost fails, Ctrl+C and run codex login --device-auth, then follow the code steps. Verify with codex login status. codex doctor diagnoses problems.`,
        },
      },
      {
        id: "codex-first",
        title: "Your first Codex chat",
        explain: `<p>Start Codex <strong>inside the folder you want it to work in</strong>. It can only change files in that folder unless you let it do more. Type a question at its prompt and press <kbd>Enter</kbd>.</p>
<ul><li>Type <code>/</code> to see Codex's commands. <code>/status</code> shows your account and limits; <code>/model</code> picks the model.</li><li>When it wants to run a command, it shows it and asks. Read it, then approve or say no.</li><li>Leave with <code>/quit</code> (or <kbd>Ctrl</kbd>+<kbd>C</kbd>).</li></ul>`,
        code: [
          { where: "ubuntu", text: "cd ~/projects/playground\ncodex" },
          { where: "codex", text: "Look around this folder and tell me what's in it, in plain words. Don't change anything." },
        ],
        exercise: {
          task: `Start Codex in your playground and ask it to describe the folder. Then run <code>/status</code>.`,
          check: `Codex lists your notes and files, and <code>/status</code> shows your account.`,
          solution: `cd ~/projects/playground ; codex ; type the prompt ; approve any ls/cat it proposes ; /status ; /quit. If it asks whether to trust the folder, yes for playground.`,
        },
      },
      {
        id: "codex-doctor",
        title: "codex doctor and codex update",
        explain: `<p>Two maintenance commands to remember:</p>
<ul><li><code>codex doctor</code>: checks the install, login and settings, and tells you what's wrong.</li><li><code>codex update</code>: updates Codex. It changes often, so run this every week or two.</li></ul>`,
        code: [{ where: "ubuntu", text: "codex doctor" }],
        exercise: {
          task: `Run the health check.`,
          check: `It reports your install and login as OK (warnings about optional things are fine).`,
          solution: `codex doctor ; read the summary. codex update to upgrade.`,
        },
      },
    ],
    capstone: {
      id: "codex-capstone",
      title: "Codex reviews your setup",
      task: `<ol><li>Add Codex's version to your setup log using <code>&gt;&gt;</code> (hint: <code>codex --version</code> prints text; you can redirect it like <code>echo</code>).</li><li>Start Codex in <code>~/projects/playground</code> and ask it to read <code>notes/setup-log.md</code> and your <code>~/.bashrc</code> additions, explain each of your aliases back to you, and suggest <strong>one</strong> more useful alias.</li><li>If you like the suggestion, add it to <code>.bashrc</code> <strong>yourself</strong> in nano and reload.</li></ol>`,
      check: `The log has the Codex version, and your new alias works in a fresh tab.`,
      solution: `codex --version >> ~/projects/playground/notes/setup-log.md ; cd ~/projects/playground ; codex ; prompt: "Read notes/setup-log.md and the end of ~/.bashrc. Explain each alias I made and suggest one more useful alias. Don't edit anything." (Codex may need approval to read ~/.bashrc since it's outside the folder.) ; then nano ~/.bashrc, add the alias, source ~/.bashrc.`,
    },
  },

  // ------------------------------------------------------------------ 08
  {
    id: "sysops",
    title: "08. Your First Agent: sysops-agent",
    color: "indigo",
    icon: "fa-screwdriver-wrench",
    desc: "A project where Codex helps look after your Linux system.",
    intro: `<p><code>sysops-agent</code> is a project folder whose job is looking after your computer: checking space, updates and health, and keeping notes. Codex works in it with rules you write. You'll start using version control (git) here too, but only one command of it; git gets its own course next.</p>`,
    lessons: [
      {
        id: "sysops-git",
        title: "git init (just this, for now)",
        explain: `<p><strong>git</strong> keeps a history of every change in a folder, so nothing is ever truly lost. <code>git init</code> switches it on for the folder you're in. That's all you need today: the Git course will teach you to use it properly.</p>
<p>Codex works better in a folder with git turned on: it can show you exactly what it changed.</p>`,
        code: [{ where: "ubuntu", text: "cd ~/projects/sysops-agent\ngit init" }],
        exercise: {
          task: `Turn on git in <code>sysops-agent</code>.`,
          check: `It says <code>Initialized empty Git repository in /home/yourname/projects/sysops-agent/.git/</code>, and <code>ls -a</code> shows a hidden <code>.git</code> folder.`,
          solution: `cd ~/projects/sysops-agent ; git init ; ls -a. (A hint message about branch names is fine.)`,
        },
      },
      {
        id: "sysops-agents-md",
        title: "AGENTS.md: rules for your agent",
        explain: `<p>Codex reads a file called <code>AGENTS.md</code> in the project before it starts. It's where you tell it who you are, what this project is and what it must never do. Start from this one and make it yours. Open nano, paste with right-click, edit, save.</p>`,
        code: [
          { where: "ubuntu", text: "nano ~/projects/sysops-agent/AGENTS.md" },
          { where: "file", file: "starter/sysops-AGENTS.md" },
        ],
        exercise: {
          task: `Create <code>AGENTS.md</code> in sysops-agent and change at least the "About me" lines to be about you.`,
          check: `<code>cat ~/projects/sysops-agent/AGENTS.md</code> shows your version.`,
          solution: `nano ~/projects/sysops-agent/AGENTS.md ; paste template (right-click) ; edit name lines ; Ctrl+O Enter Ctrl+X ; cat it. Codex's /init command can also draft one, but writing it herself is the point.`,
        },
      },
      {
        id: "sysops-permissions",
        title: "Who's in charge: approvals",
        explain: `<p>Codex can read, edit and run commands. How much it does without asking is up to you. Start Codex in sysops-agent and type <code>/permissions</code> to see the choices. While you're learning, keep the setting where it <strong>asks before running commands</strong>.</p>
<p>Codex can't type your <code>sudo</code> password, and it shouldn't. When it needs admin rights, it'll tell you the command; you read it and run it yourself.</p>`,
        code: [
          { where: "ubuntu", text: "cd ~/projects/sysops-agent\ncodex" },
          { where: "codex", text: "/permissions" },
        ],
        exercise: {
          task: `Start Codex in sysops-agent, look at <code>/permissions</code>, and ask it: "What rules did you read in AGENTS.md?"`,
          check: `Codex repeats your rules back, which proves it read the file.`,
          solution: `cd ~/projects/sysops-agent ; codex ; /permissions (leave on the default that asks for approval) ; ask the question. If it says it found no AGENTS.md, check the file name and that Codex was started in that folder.`,
        },
      },
      {
        id: "sysops-tasks",
        title: "Ask it real system questions",
        explain: `<p>Now use Codex as your system helper. Ask in plain words. Watch which commands it proposes: it's a great way to learn new ones. Ask "what does that command do?" whenever you're unsure, before you approve.</p>`,
        code: [
          { where: "codex", text: "How much disk space is my Linux system using, and what are the five biggest folders in my home folder? Explain the commands you use." },
          { where: "codex", text: "Are there any updates waiting? Don't run sudo; tell me the command and I'll run it myself." },
        ],
        exercise: {
          task: `Ask Codex both questions. Approve the read-only commands; run any <code>sudo</code> command it suggests yourself in a second tab.`,
          check: `You learn at least two new commands (it'll probably use <code>df</code> and <code>du</code>). Write them in your setup log.`,
          solution: `Codex typically runs df -h and du -sh ~/* | sort -h | tail -5, and apt list --upgradable. She approves, reads output, runs sudo apt update herself if suggested. Then echo "learned: df -h, du -sh" >> ~/projects/playground/notes/setup-log.md.`,
        },
      },
      {
        id: "sysops-exec",
        title: "codex exec: one-shot questions",
        explain: `<p>For a quick question you don't need the full chat. <code>codex exec "..."</code> answers and exits. Wrap the question in quotes.</p>`,
        code: [{ where: "ubuntu", text: 'cd ~/projects/sysops-agent\ncodex exec "How long has this system been running, and how much memory is free? Read-only."' }],
        exercise: {
          task: `Ask a one-shot question about your system with <code>codex exec</code>.`,
          check: `You get an answer and land back at your normal prompt.`,
          solution: `codex exec "..." from the sysops-agent folder. It may use uptime and free -h.`,
        },
      },
    ],
    capstone: {
      id: "sysops-capstone",
      title: "Build a health-check script with Codex",
      task: `<ol><li>Ask Codex to create <code>scripts/health-check.sh</code> in sysops-agent: a script that prints disk use, memory, uptime and how many updates are waiting, with a short label on each. It must not use sudo or change anything.</li><li>Read the script with <code>cat</code> before running it. Ask Codex about any line you don't understand.</li><li>Run it with <code>bash scripts/health-check.sh</code>.</li><li>Add an alias <code>health</code> to your <code>.bashrc</code> that runs it from anywhere (use the full path).</li></ol>`,
      check: `In a new tab, typing <code>health</code> prints your system report.`,
      solution: `In sysops-agent with codex: "Create scripts/health-check.sh that prints labelled disk use (df -h /), memory (free -h), uptime (uptime -p) and the number of upgradable packages (apt list --upgradable 2>/dev/null | tail -n +2 | wc -l). No sudo, read-only." ; cat scripts/health-check.sh ; bash scripts/health-check.sh ; nano ~/.bashrc add alias health='bash ~/projects/sysops-agent/scripts/health-check.sh' ; source ~/.bashrc.`,
    },
  },

  // ------------------------------------------------------------------ 09
  {
    id: "docker",
    title: "09. Docker: Apps in Boxes",
    color: "cyan",
    icon: "fa-cubes",
    desc: "Install Docker and run your first containers.",
    intro: `<p>A <strong>container</strong> is an app packed in a box with everything it needs, so it runs the same everywhere and doesn't clutter your system. <strong>Docker</strong> builds and runs those boxes. In section 11 you'll put your own chatbot in one.</p>
<p>You'll install Docker inside Ubuntu (no Docker Desktop needed). Use Codex to explain anything along the way.</p>`,
    lessons: [
      {
        id: "docker-install",
        title: "Install Docker",
        explain: `<p>Ubuntu's catalogue has Docker. <code>docker.io</code> is the engine; <code>docker-compose-v2</code> adds <code>docker compose</code>, which starts apps from a recipe file.</p>
<p>Before you run it, ask Codex (in sysops-agent) what these packages are. Getting a second opinion before a <code>sudo</code> install is a good habit.</p>`,
        code: [
          { where: "codex", text: "I'm about to run: sudo apt install -y docker.io docker-compose-v2  What will this install, and is it right for Ubuntu in WSL? Don't run it." },
          { where: "ubuntu", text: "sudo apt install -y docker.io docker-compose-v2" },
        ],
        exercise: {
          task: `Check the command with Codex, then install Docker.`,
          check: `<code>docker --version</code> and <code>docker compose version</code> both print versions.`,
          solution: `sudo apt update first if needed ; sudo apt install -y docker.io docker-compose-v2 ; docker --version ; docker compose version. If docker-compose-v2 isn't found, try sudo apt install -y docker-compose-plugin or install from Docker's own apt repository (docs.docker.com/engine/install/ubuntu).`,
        },
      },
      {
        id: "docker-group",
        title: "Use Docker without sudo",
        explain: `<p>By default only root can talk to Docker. Adding yourself to the <code>docker</code> <strong>group</strong> lets you use it without <code>sudo</code>. (<code>$USER</code> fills in your name.)</p>
<p>Group changes only apply after you log in again. For WSL, that means shutting Ubuntu down from PowerShell and reopening it.</p>
<p class="tip">Docker also needs its background service running: <code>systemctl is-active docker</code> should say <code>active</code>.</p>`,
        code: [
          { where: "ubuntu", text: "sudo usermod -aG docker $USER" },
          { where: "powershell", text: "wsl --shutdown" },
          { where: "ubuntu", text: "groups\nsystemctl is-active docker" },
        ],
        exercise: {
          task: `Add yourself to the docker group, restart WSL, and confirm.`,
          check: `<code>groups</code> lists <code>docker</code>, and the service says <code>active</code>.`,
          solution: `sudo usermod -aG docker $USER ; in PowerShell wsl --shutdown ; reopen Ubuntu tab ; groups ; systemctl is-active docker. If "System has not been booted with systemd": add [boot] systemd=true to /etc/wsl.conf (sudo nano /etc/wsl.conf) then wsl --shutdown. If inactive: sudo systemctl enable --now docker.`,
        },
      },
      {
        id: "docker-hello",
        title: "docker run hello-world",
        explain: `<p><code>docker run IMAGE</code> downloads an <strong>image</strong> (the packed app) if you don't have it, makes a container from it and runs it. <code>hello-world</code> is a tiny test image that prints a message and stops.</p>`,
        code: [{ where: "ubuntu", text: "docker run hello-world" }],
        exercise: {
          task: `Run the hello-world container.`,
          check: `You see <code>Hello from Docker!</code> and a short explanation of what just happened.`,
          solution: `docker run hello-world. "permission denied ... docker.sock": the group change hasn't applied; wsl --shutdown and reopen, or check groups. "Cannot connect to the Docker daemon": sudo systemctl start docker.`,
        },
      },
      {
        id: "docker-ps",
        title: "docker ps and docker images",
        explain: `<ul><li><code>docker ps</code>: running containers. Add <code>-a</code> to include stopped ones.</li><li><code>docker images</code>: images you've downloaded.</li><li><code>docker rm NAME</code> removes a stopped container; <code>docker container prune</code> removes all stopped ones (it asks first).</li></ul>`,
        code: [{ where: "ubuntu", text: "docker ps -a\ndocker images" }],
        exercise: {
          task: `Find your stopped hello-world container, then clean up all stopped containers.`,
          check: `<code>docker ps -a</code> is empty afterwards, but <code>docker images</code> still lists <code>hello-world</code>.`,
          solution: `docker ps -a ; docker container prune, answer y ; docker ps -a ; docker images.`,
        },
      },
      {
        id: "docker-compose",
        title: "docker compose: apps from a recipe",
        explain: `<p>Real apps need settings: ports, files, passwords. Instead of one long <code>docker run</code> line, you write them in a <code>compose.yaml</code> file and run <code>docker compose up -d</code> (<code>-d</code>: run in the background).</p>
<p>This recipe runs the <strong>nginx</strong> web server and connects it to port 8080 on your computer. <code>127.0.0.1</code> means only your own PC can reach it. In YAML files, <strong>indentation matters</strong>: use spaces, not tabs.</p>
<ul><li><code>docker compose logs</code>: see what it printed.</li><li><code>docker compose down</code>: stop and remove it.</li></ul>`,
        code: [
          { where: "ubuntu", text: "mkdir -p ~/projects/playground/web && cd ~/projects/playground/web\nnano compose.yaml" },
          { where: "file", text: "services:\n  web:\n    image: nginx:alpine\n    ports:\n      - \"127.0.0.1:8080:80\"\n" },
          { where: "ubuntu", text: "docker compose up -d" },
          { where: "browser", text: "http://localhost:8080" },
        ],
        exercise: {
          task: `Start the nginx container with compose and open it in your Windows browser.`,
          check: `The browser shows <strong>Welcome to nginx!</strong>`,
          solution: `In ~/projects/playground/web create compose.yaml as shown (2-space indents) ; docker compose up -d ; open http://localhost:8080 in Windows browser ; docker compose logs to see the request. YAML errors usually mean bad indentation.`,
        },
      },
    ],
    capstone: {
      id: "docker-capstone",
      title: "Your own web page in a container",
      task: `<ol><li>In <code>~/projects/playground/web</code>, ask Codex to create a <code>site/index.html</code>: a one-page "about me" with your name and three things you're learning.</li><li>Ask Codex to change <code>compose.yaml</code> so nginx serves the <code>site</code> folder (hint for you both: a <strong>volume</strong> that maps <code>./site</code> to <code>/usr/share/nginx/html</code>, read-only).</li><li>Read both files with <code>cat</code>, then restart with <code>docker compose up -d</code> and refresh the browser.</li><li>Edit the page in nano, refresh again (no restart needed), then <code>docker compose down</code>.</li></ol>`,
      check: `Your page shows at <code>http://localhost:8080</code>, your edit shows on refresh, and <code>docker ps</code> is empty at the end.`,
      solution: `codex in ~/projects/playground/web: "Create site/index.html, a simple about-me page for Sarah... Then update compose.yaml so nginx serves ./site read-only." Resulting compose service has volumes: - ./site:/usr/share/nginx/html:ro ; cat files ; docker compose up -d ; refresh ; nano site/index.html ; refresh ; docker compose down ; docker ps.`,
    },
  },

  // ------------------------------------------------------------------ 10
  {
    id: "openrouter",
    title: "10. OpenRouter: AI Models on Your Own Key",
    color: "fuchsia",
    icon: "fa-key",
    desc: "Get your own API key and talk to AI models straight from the terminal.",
    intro: `<p>ChatGPT Plus covers chatting and Codex. To build <em>your own</em> AI tools, you need an <strong>API key</strong>: a secret password that lets a program use a model, paid per use. <strong>OpenRouter</strong> gives you one key for hundreds of models from different companies, and tiny prices: a short question to a small model costs a fraction of a cent.</p>
<p class="warn">An API key is like a credit card number. Never paste it into a chat (including this helper and Codex), a screenshot, or anything you share or put in git.</p>`,
    lessons: [
      {
        id: "or-account",
        title: "Make an account and a key (in the browser)",
        explain: `<p>These steps are yours, in your browser. Nothing here does them for you:</p>
<ol><li>Go to OpenRouter and sign up.</li><li>Under <strong>Credits</strong>, add a small amount, like $5. That will last a long time for learning.</li><li>Under <strong>Keys</strong>, create a key named <code>terminal-buddy</code> and give it a <strong>credit limit</strong> (say $2). The limit caps what a leaked or buggy key can spend.</li><li>Copy the key (it starts with <code>sk-or-</code>). It's only shown once; keep the tab open for the next lesson.</li></ol>`,
        code: [{ where: "browser", text: "https://openrouter.ai" }],
        exercise: {
          task: `Create your OpenRouter account, add credits and create a key with a credit limit.`,
          check: `The Keys page lists <code>terminal-buddy</code> with your limit.`,
          solution: `Browser steps only: sign up at openrouter.ai, Credits > add, Keys > Create key, name terminal-buddy, set credit limit, copy the key. Never paste the key into the helper chat.`,
        },
      },
      {
        id: "or-env",
        title: "Keep the key in a .env file",
        explain: `<p>Programs read secrets from a file called <code>.env</code> in the project folder. You'll make the project folder now and put the key there. Replace the example with your real key (paste with right-click).</p>
<p><code>chmod 600 .env</code> makes the file readable only by you. (<code>chmod</code> changes a file's permissions.)</p>`,
        code: [
          { where: "ubuntu", text: "mkdir -p ~/projects/terminal-buddy && cd ~/projects/terminal-buddy\nnano .env" },
          { where: "file", text: "OPENROUTER_API_KEY=sk-or-paste-your-key-here\n" },
          { where: "ubuntu", text: "chmod 600 .env\nls -la" },
        ],
        exercise: {
          task: `Create <code>~/projects/terminal-buddy/.env</code> with your key and lock it down.`,
          check: `<code>ls -la</code> shows <code>.env</code> with <code>-rw-------</code> at the start of its line. (Don't <code>cat</code> it on screen; screens get shared.)`,
          solution: `mkdir -p ~/projects/terminal-buddy ; cd there ; nano .env ; one line OPENROUTER_API_KEY=sk-or-... (no spaces, no quotes needed) ; save ; chmod 600 .env ; ls -la shows -rw-------.`,
        },
      },
      {
        id: "or-load",
        title: "Load the key into your shell",
        explain: `<p>To use the key from the terminal, load <code>.env</code> as variables. <code>set -a</code> means "export everything I set from now on", and <code>source</code> reads the file. <code>set +a</code> switches that off again.</p>
<p>To check it loaded without showing the whole key, print only its first six letters. <code>cut -c1-6</code> keeps characters 1 to 6 of whatever is piped into it:</p>`,
        code: [
          { where: "ubuntu", text: "set -a; source .env; set +a" },
          { where: "ubuntu", text: 'echo "$OPENROUTER_API_KEY" | cut -c1-6' },
        ],
        exercise: {
          task: `Load your key in the terminal-buddy folder and check it's there without printing the whole thing.`,
          check: `It prints <code>sk-or-</code> and nothing more.`,
          solution: `cd ~/projects/terminal-buddy ; set -a; source .env; set +a ; echo "$OPENROUTER_API_KEY" | cut -c1-6 -> sk-or-. Empty output means the file name or variable name is wrong.`,
        },
      },
      {
        id: "or-curl",
        title: "Ask a model with curl",
        explain: `<p>Programs talk to OpenRouter by sending a <strong>request</strong> to a web address. <code>curl</code> can do that by hand. This one sends a question and uses <code>jq</code> to pull out just the answer. The <code>\\</code> at line ends lets one command span several lines.</p>`,
        code: [
          {
            where: "ubuntu",
            text: `curl -s https://openrouter.ai/api/v1/chat/completions \\
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model": "anthropic/claude-haiku-5.5", "max_tokens": 300,
       "messages": [{"role": "user", "content": "In two sentences, what does the Linux command ls do?"}]}' \\
  | jq -r '.choices[0].message.content'`,
          },
        ],
        exercise: {
          task: `Send the request and get an answer. Then change the question to something of your own.`,
          check: `A short answer prints. If you see <code>null</code>, run it again without the last line (<code>| jq ...</code>) to see the full reply, which includes the error.`,
          solution: `Load .env first. Run the curl. null usually means an error: 401 = key not loaded or wrong; 402 = no credits; 400 = JSON quoting broken (single quotes around the -d data, double quotes inside). The model name must exist on openrouter.ai/models.`,
        },
      },
    ],
    capstone: {
      id: "openrouter-capstone",
      title: "Compare two models, check the bill",
      task: `<ol><li>Pick a second model from the OpenRouter models page (look for small, cheap ones).</li><li>Send the same question to both by changing only the <code>"model"</code> value. Ask something from this course, like "explain chmod 600".</li><li>Ask Codex (in terminal-buddy) to turn your curl command into a script <code>ask.sh</code> that takes the question as an argument, loads <code>.env</code> itself and never prints the key. Read it, then try <code>bash ask.sh "what is a pipe?"</code>.</li><li>Open OpenRouter's <strong>Activity</strong> page and see what your questions cost.</li></ol>`,
      check: `Two answers to compare, a working <code>ask.sh</code>, and a cost on the Activity page (probably well under a cent).`,
      solution: `Change "model" to e.g. google/gemini-2.5-flash-lite. Codex prompt: "Write ask.sh that loads .env from this folder, sends $1 as the question to OpenRouter's chat completions API with curl, prints only the answer with jq, and never prints the key. Don't read .env yourself." ; cat ask.sh ; bash ask.sh "what is a pipe?" ; openrouter.ai Activity page.`,
    },
  },

  // ------------------------------------------------------------------ 11
  {
    id: "buddy",
    title: "11. Build Your Own Terminal Helper",
    color: "lime",
    icon: "fa-comments",
    desc: "Codex, Docker and OpenRouter together: your own chatbot in a container.",
    intro: `<p>Time to put it all together. You'll build <strong>terminal-buddy</strong>: a small web chatbot, running in Docker on your PC, using your OpenRouter key, whose job is helping you with the terminal. Codex does most of the building; you direct it and check its work.</p>
<p>When it works, it becomes <em>your</em> helper. The course helper stays here too, but try yours first.</p>`,
    lessons: [
      {
        id: "buddy-project",
        title: "Set up the project",
        explain: `<p>Before Codex writes anything:</p>
<ul><li><code>git init</code>, as in sysops-agent.</li><li>A <code>.gitignore</code> file listing files git must never save. <code>.env</code> goes in it <strong>first</strong>, so your key can never end up in git history.</li><li>An <code>AGENTS.md</code> describing the project and its rules (including: never read or print <code>.env</code>).</li></ul>`,
        code: [
          { where: "ubuntu", text: "cd ~/projects/terminal-buddy\ngit init\necho \".env\" > .gitignore\nnano AGENTS.md" },
          { where: "file", file: "starter/buddy-AGENTS.md" },
        ],
        exercise: {
          task: `Turn on git, create <code>.gitignore</code> with <code>.env</code> in it, and write <code>AGENTS.md</code>.`,
          check: `<code>git status</code> lists <code>.gitignore</code> and <code>AGENTS.md</code> but <strong>not</strong> <code>.env</code>.`,
          solution: `cd ~/projects/terminal-buddy ; git init ; echo ".env" > .gitignore ; nano AGENTS.md paste template ; git status shows untracked .gitignore and AGENTS.md only. If .env shows, the .gitignore line is wrong.`,
        },
      },
      {
        id: "buddy-build",
        title: "Have Codex build it",
        explain: `<p>A good request to an agent says what to build, how, and what not to do. Paste this to Codex in the terminal-buddy folder. It'll propose files and ask to create them.</p>
<p class="tip">Approve file creation; read each command it wants to run. If it asks to run docker, that's fine in this folder.</p>`,
        code: [
          { where: "ubuntu", text: "cd ~/projects/terminal-buddy\ncodex" },
          { where: "codex", file: "starter/buddy-prompt.txt" },
        ],
        exercise: {
          task: `Give Codex the request and let it build the files.`,
          check: `<code>ls</code> shows something like <code>Dockerfile</code>, <code>compose.yaml</code>, <code>server.js</code> and a <code>public</code> folder.`,
          solution: `Start codex in ~/projects/terminal-buddy, paste the build prompt, approve file writes. Expected files: Dockerfile, compose.yaml, server.js, public/index.html, prompt.md, .env.example. If Codex gets stuck, the lesson "If Codex gets stuck" has a working reference version.`,
        },
      },
      {
        id: "buddy-review",
        title: "Read what it made",
        explain: `<p>Never run code you haven't looked at, even your own agent's. You don't need to understand every line; look for the big things:</p>
<ul><li><code>compose.yaml</code>: does the port start with <code>127.0.0.1</code> (only your PC)? Does it read <code>.env</code>?</li><li><code>server.js</code>: is the key read from the environment, not written in the file?</li><li>Ask Codex to explain any part in plain words.</li></ul>`,
        code: [
          { where: "ubuntu", text: "tree -a -I .git\ncat compose.yaml\ngrep -n OPENROUTER server.js" },
          { where: "codex", text: "Walk me through how a message I type in the page gets to the model and back. Which files are involved?" },
        ],
        exercise: {
          task: `Check the three things above. <code>grep</code> searches a file for a word and shows matching lines (<code>-n</code> adds line numbers).`,
          check: `The port is <code>127.0.0.1:3000:3000</code> (or similar), and the key appears only as <code>process.env.OPENROUTER_API_KEY</code>, never as <code>sk-or-...</code>.`,
          solution: `tree -a -I .git ; cat compose.yaml (ports: "127.0.0.1:3000:3000", env_file: .env) ; grep -n OPENROUTER server.js shows process.env.OPENROUTER_API_KEY. If the port lacks 127.0.0.1, ask Codex to add it.`,
        },
      },
      {
        id: "buddy-run",
        title: "Build, run and debug",
        explain: `<p><code>--build</code> tells compose to build your own image from the <code>Dockerfile</code> first. If the page doesn't work, the answer is almost always in the logs. <code>-f</code> means "follow": keep showing new lines (stop with <kbd>Ctrl</kbd>+<kbd>C</kbd>).</p>`,
        code: [
          { where: "ubuntu", text: "docker compose up -d --build" },
          { where: "browser", text: "http://localhost:3000" },
          { where: "ubuntu", text: "docker compose logs -f" },
        ],
        exercise: {
          task: `Start your bot and ask it "how do I list hidden files?"`,
          check: `It answers with <code>ls -a</code> (or <code>ls -la</code>) in the page.`,
          solution: `docker compose up -d --build ; browser http://localhost:3000 ; ask. If the page doesn't load: docker compose ps, docker compose logs. 401 from OpenRouter in logs = key not passed (env_file in compose). Paste the log lines (never the key) to Codex and ask it to fix.`,
        },
      },
      {
        id: "buddy-reference",
        title: "If Codex gets stuck: a working version",
        explain: `<p>Agents sometimes go round in circles. If yours does, here's a small working version to compare against or use as-is. Make each file with nano and paste. (<code>mkdir -p public</code> first.)</p>`,
        code: [
          { where: "file", file: "starter/buddy/compose.yaml", label: "compose.yaml" },
          { where: "file", file: "starter/buddy/Dockerfile", label: "Dockerfile" },
          { where: "file", file: "starter/buddy/server.js", label: "server.js" },
          { where: "file", file: "starter/buddy/prompt.md", label: "prompt.md" },
          { where: "file", file: "starter/buddy/public/index.html", label: "public/index.html" },
        ],
        exercise: {
          task: `Only if needed: compare Codex's files with these, or replace them, then rebuild.`,
          check: `<code>docker compose up -d --build</code> runs and the page answers.`,
          solution: `Create files with nano at those paths, then docker compose up -d --build. The reference reads OPENROUTER_API_KEY and BUDDY_MODEL from .env, listens on 3000, compose binds 127.0.0.1:3000.`,
        },
      },
    ],
    capstone: {
      id: "buddy-capstone",
      title: "Make it yours",
      task: `<ol><li>Edit the bot's instructions (<code>prompt.md</code> or wherever Codex put them) so it knows your setup: Windows, WSL Ubuntu, your project folders, and that it should give hints before answers.</li><li>Try a different model by setting <code>BUDDY_MODEL=</code> in <code>.env</code> (or the way your version does it).</li><li>Rebuild and test it on a question from section 06.</li><li>Add an alias <code>buddy</code> that starts it from anywhere, e.g. <code>cd ~/projects/terminal-buddy &amp;&amp; docker compose up -d</code>.</li><li>Pin <code>http://localhost:3000</code> in your browser. This is your helper now.</li></ol>`,
      check: `In a new tab, <code>buddy</code> starts it, and it answers in the style you asked for.`,
      solution: `nano prompt.md ; nano .env add BUDDY_MODEL=google/gemini-2.5-flash-lite (or other) ; docker compose up -d --build ; test ; nano ~/.bashrc add alias buddy='cd ~/projects/terminal-buddy && docker compose up -d' ; source ~/.bashrc.`,
    },
  },
];

window.COMING_NEXT = {
  title: "12. Git, Properly",
  icon: "fa-code-branch",
  desc: "Its own course: saving history, undoing mistakes, GitHub, and working with Codex on branches. Coming next.",
};
