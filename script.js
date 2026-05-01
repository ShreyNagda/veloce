/**
 * VELOCE - Next.js Project Configurator
 * Command generation and clipboard functionality
 * Uses Phosphor Icons for all iconography
 */

(function () {
  "use strict";

  // ============================================
  // DOM References
  // ============================================
  const elements = {
    projectName: document.getElementById("projectName"),
    pkg: document.getElementById("pkg"),
    ts: document.getElementById("ts"),
    tailwind: document.getElementById("tailwind"),
    appRouter: document.getElementById("appRouter"),
    empty: document.getElementById("empty"),
    turbo: document.getElementById("turbo"),
    compiler: document.getElementById("compiler"),
    skipInstall: document.getElementById("skipInstall"),
    srcDir: document.getElementById("srcDir"),
    alias: document.getElementById("alias"),
    output: document.getElementById("output"),
    copyBtn: document.getElementById("copyBtn"),
  };

  // ============================================
  // Package Manager Command Mapping
  // ============================================
  const packageManagerCommands = {
    npm: "npx create-next-app@latest",
    pnpm: "pnpm create next-app",
    yarn: "yarn create next-app",
    bun: "bun create next-app",
  };

  /**
   * Get the create command based on selected package manager
   * @param {string} pkg - Package manager identifier
   * @returns {string} The full create command
   */
  function getCreateCommand(pkg) {
    return packageManagerCommands[pkg] || "npx create-next-app@latest";
  }

  // ============================================
  // Utility Functions
  // ============================================

  /**
   * Sanitize project name (lowercase, replace spaces with hyphens)
   * @param {string} name - Raw project name input
   * @returns {string} Sanitized project name
   */
  function sanitizeProjectName(name) {
    const trimmed = name.trim();
    if (trimmed === "") return "my-app";
    return trimmed.replace(/\s+/g, "-").toLowerCase();
  }

  /**
   * Toggle info box visibility
   * @param {string} infoId - The ID of the info box to toggle
   */
  function toggleInfo(infoId) {
    const infoBox = document.getElementById(infoId);
    const button = document.querySelector(
      `[onclick="toggleInfo('${infoId}')"]`,
    );

    if (infoBox) {
      const isHidden = infoBox.classList.contains("hidden");
      infoBox.classList.toggle("hidden");

      // Update aria-expanded attribute
      if (button) {
        button.setAttribute("aria-expanded", isHidden ? "true" : "false");
      }
    }
  }

  // ============================================
  // Command Generation
  // ============================================

  /**
   * Build and update the command string based on current form values
   */
  function updateCommand() {
    // Get sanitized values
    const projectName = sanitizeProjectName(elements.projectName.value);
    const createCommand = getCreateCommand(elements.pkg.value);
    const aliasValue = elements.alias.value.trim() || "@/*";

    // Build flags array
    const flags = [
      createCommand,
      projectName,
      elements.ts.checked ? "--ts" : "--js",
      elements.tailwind.checked ? "--tailwind" : "--no-tailwind",
      elements.appRouter.checked ? "--app" : "--pages",
      `--import-alias "${aliasValue}"`,
    ];

    // Add optional flags based on checkbox states
    if (elements.empty.checked) flags.push("--empty");
    if (elements.turbo.checked) flags.push("--turbo");
    if (elements.compiler.checked) flags.push("--react-compiler");
    if (elements.skipInstall.checked) flags.push("--skip-install");
    if (elements.srcDir.checked) flags.push("--src-dir");

    // Always add non-interactive flag
    flags.push("--yes");

    // Update the output display
    elements.output.textContent = flags.join(" ");
  }

  // ============================================
  // Clipboard Functionality
  // ============================================

  /**
   * Copy the generated command to clipboard
   * Provides visual feedback on success/failure using Phosphor icons
   */
  function copyCommand() {
    const textToCopy = elements.output.textContent;

    if (!textToCopy) {
      console.warn("No command to copy");
      return;
    }

    // Use modern clipboard API
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        showCopyFeedback(true);
      })
      .catch((error) => {
        // Fallback for older browsers
        console.error("Clipboard write failed:", error);
        fallbackCopy(textToCopy);
      });
  }

  /**
   * Fallback copy method using execCommand
   * @param {string} text - Text to copy
   */
  function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);

    try {
      textarea.select();
      textarea.setSelectionRange(0, text.length);
      document.execCommand("copy");
      showCopyFeedback(true);
    } catch (err) {
      console.error("Fallback copy failed:", err);
      showCopyFeedback(false);
    }

    document.body.removeChild(textarea);
  }

  /**
   * Show visual feedback on copy button using Phosphor icons
   * @param {boolean} success - Whether copy was successful
   */
  function showCopyFeedback(success) {
    const btn = elements.copyBtn;
    const originalHTML = btn.innerHTML;

    if (success) {
      btn.innerHTML = '<i class="ph ph-check-circle text-base"></i> Copied!';
      btn.classList.add("copied");
    } else {
      btn.innerHTML = '<i class="ph ph-warning-circle text-base"></i> Failed';
    }

    // Reset button after delay
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.classList.remove("copied");
    }, 2000);
  }

  // ============================================
  // Event Listeners
  // ============================================

  /**
   * Attach event listeners to all form elements
   */
  function attachEventListeners() {
    // Input and select elements
    const inputElements = [elements.projectName, elements.pkg, elements.alias];

    // Checkbox elements
    const checkboxElements = [
      elements.ts,
      elements.tailwind,
      elements.appRouter,
      elements.empty,
      elements.turbo,
      elements.compiler,
      elements.skipInstall,
      elements.srcDir,
    ];

    // Attach listeners to text/select inputs
    inputElements.forEach((element) => {
      if (element) {
        element.addEventListener("input", updateCommand);
        element.addEventListener("change", updateCommand);
      }
    });

    // Attach listeners to checkboxes
    checkboxElements.forEach((element) => {
      if (element) {
        element.addEventListener("change", updateCommand);
      }
    });

    // Copy button
    if (elements.copyBtn) {
      elements.copyBtn.addEventListener("click", copyCommand);
    }

    // Keyboard shortcut (Ctrl/Cmd + C) when focused on output
    if (elements.output) {
      elements.output.setAttribute("tabindex", "0");
      elements.output.addEventListener("keydown", (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === "c") {
          event.preventDefault();
          copyCommand();
        }
      });
    }
  }

  // ============================================
  // Initialization
  // ============================================

  /**
   * Initialize the application
   */
  function init() {
    attachEventListeners();
    updateCommand(); // Generate initial command

    console.log("⚡ Veloce configurator initialized");
  }

  // Start the application when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose functions to global scope
  window.toggleInfo = toggleInfo;
  window.copyCommand = copyCommand;
})();
