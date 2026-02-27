export function initVersionWatcher(currentVersion) {
    let lastCheck = 0;
    let abortController = null;

    const checkServer = async () => {
        const now = Date.now();
        if (now - lastCheck < 5000) return;
        lastCheck = now;

        // If there's an ongoing request, cancel it
        if (abortController) {
            abortController.abort();
        }

        abortController = new AbortController();
        const { signal } = abortController;

        try {
            const response = await fetch(`/version.json?cb=${Date.now()}`, { signal });
            if (!response.ok) throw new Error('Network response was not ok');
        
            lastCheck = Date.now();

            const data = await response.json();

            if (data.version !== currentVersion) {
                updateUI(data.version);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Fetch aborted: A newer request took over.');
            } else {
                console.error('Fetch error:', error);
            }
        } finally {
            // Clear the controller if this was the latest one
            if (abortController?.signal === signal) {
                abortController = null;
            }
        }
    };

    const handleReactivation = () => {
        checkServer();
    };

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            handleReactivation();
        }
    });    

    // Triggers when clicking back into the window from another app or monitor
    window.addEventListener('pageshow', handleReactivation);    

    window.addEventListener('focus', handleReactivation);

    const updateUI = (serverVersion) => {
        const indicator = document.getElementById('version-indicator');
        if (indicator) {
            indicator.style.color = '#e74c3c';
            indicator.innerHTML = `
                <button onclick="window.location.reload()" style="
                    background: #e74c3c; color: white; border: none; 
                    padding: 8px; border-radius: 4px; cursor: pointer;
                    width: 100%; font-weight: bold; margin-top: 5px;
                ">Update to ${serverVersion}</button>
            `;
        }
    };

    const injectNav = () => {
        const navUl = document.querySelector('nav ul');
        if (!navUl || document.getElementById('version-status')) return;

        const li = document.createElement('li');
        li.id = 'version-status';
        li.style.cssText = 'padding: 15px; font-size: 13px; border-top: 1px solid #eee; margin-top: auto;';
        li.innerHTML = `
            <div style="color: #999;">Browser Build: ${currentVersion}</div>
            <div id="version-indicator" style="color: #2ecc71;">● System Synced</div>
        `;
        navUl.appendChild(li);
        checkServer();
    };

    const observer = new MutationObserver(() => {
        if (document.querySelector('nav ul')) injectNav();
    });

    observer.observe(document.body, { childList: true, subtree: true });
}