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
  // Command Generation
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
   * Get the import alias value with fallback
   * @returns {string} Formatted alias value
   */
  function getAliasValue() {
    const value = elements.alias.value.trim();
    return value || "@/*";
  }

  /**
   * Build and update the command string based on current form values
   */
  function updateCommand() {
    // Get sanitized values
    const projectName = sanitizeProjectName(elements.projectName.value);
    const createCommand = getCreateCommand(elements.pkg.value);
    const aliasValue = getAliasValue();

    // Build flags array
    const flags = [
      createCommand,
      projectName,
      elements.ts.checked ? "--typescript" : "--javascript",
      elements.tailwind.checked ? "--tailwind" : "--no-tailwind",
      elements.appRouter.checked ? "--app" : "--pages",
      `--import-alias "${aliasValue}"`,
    ];

    // Add optional flags based on checkbox states
    if (elements.empty.checked) flags.push("--empty");
    if (elements.turbo.checked) flags.push("--turbo");
    if (elements.compiler.checked) flags.push("--experimental-react-compiler");
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
        // Success feedback
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
    document.body.appendChild(textarea);
    textarea.select();

    try {
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
  // Analytics (Optional - Privacy Focused)
  // ============================================

  /**
   * Track configuration usage (anonymous, no personal data)
   */
  function trackConfiguration() {
    // Only track if in production and analytics enabled
    if (window.location.hostname === "shreynagda.github.io" && window.gtag) {
      const config = {
        typescript: elements.ts.checked,
        tailwind: elements.tailwind.checked,
        appRouter: elements.appRouter.checked,
        turbopack: elements.turbo.checked,
        compiler: elements.compiler.checked,
        packageManager: elements.pkg.value,
      };

      window.gtag("event", "configuration_generated", {
        event_category: "engagement",
        event_label: JSON.stringify(config),
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

    // Track initial configuration
    setTimeout(trackConfiguration, 1000);

    console.log("⚡ Veloce configurator initialized");
  }

  // Start the application when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose copyCommand to global scope for potential external use
  window.copyCommand = copyCommand;
})();

/**
 * Copy configuration for CLI use
 * Generates and copies the configuration summary for terminal use
 */
function copyConfigForCLI() {
  const projectName = sanitizeProjectName(
    elements.projectName?.value || "my-app",
  );
  const pkgManager = elements.pkg?.value || "npm";
  const typescript = elements.ts?.checked ? "Yes" : "No";
  const tailwind = elements.tailwind?.checked ? "Yes" : "No";
  const appRouter = elements.appRouter?.checked ? "Yes" : "No";
  const turbopack = elements.turbo?.checked ? "Yes" : "No";
  const compiler = elements.compiler?.checked ? "Yes" : "No";
  const minimalTemplate = elements.empty?.checked ? "Yes" : "No";
  const skipInstall = elements.skipInstall?.checked ? "Yes" : "No";
  const srcDir = elements.srcDir?.checked ? "Yes" : "No";
  const alias = elements.alias?.value || "@/*";

  const configText = `
Next.js Project Configuration
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Project Name: ${projectName}
Package Manager: ${pkgManager}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Core Stack:
  • TypeScript: ${typescript}
  • App Router: ${appRouter}
  • Tailwind CSS: ${tailwind}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Performance:
  • Turbopack: ${turbopack}
  • React Compiler: ${compiler}
  • Minimal Template: ${minimalTemplate}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Settings:
  • Import Alias: ${alias}
  • Skip Auto Install: ${skipInstall}
  • Source Directory: ${srcDir}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Visit https://nextjs.org/docs/getting-started/installation
for official installation instructions.
`.trim();

  navigator.clipboard
    .writeText(configText)
    .then(() => {
      const btn = document.getElementById("copyConfigBtn");
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<i class="ph ph-check-circle text-base"></i> Copied!';
      btn.classList.add("copied");

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.classList.remove("copied");
      }, 2000);
    })
    .catch(() => {
      const btn = document.getElementById("copyConfigBtn");
      btn.innerHTML = '<i class="ph ph-warning-circle text-base"></i> Failed';
      setTimeout(() => {
        btn.innerHTML =
          '<i class="ph ph-copy text-base"></i> Copy Configuration';
      }, 2000);
    });
}

// Expose to global scope
window.copyConfigForCLI = copyConfigForCLI;
