/**
 * 
 * ADMIN COLLECTIONS
 *
**/

const menuCollection = {
    name: "menu-configuration",
    label: "Menu Configuration",
    delete: false, // Safety: hides the 'Delete' button in the UI
    editor: {
        preview: false // Menus usually don't need a live preview
    },
    files: [
        {
            label: "Maintain Menu",
            name: "menu",
            file: "data/menu.yml",
            fields: [
                {
                    label: "Menu Items",
                    name: "main", // Matches the key in 'data/menu.yml'
                    widget: "list",
                    summary: "{{fields.name}}", // Shows the link name in the list view
                    fields: [
                        { label: "Link Name", name: "name", widget: "string" },
                        { label: "URL", name: "url", widget: "string" }
                    ]
                }
            ]
        }
    ]
};

/**
 * 
 * EDITOR COLLECTIONS
 *
**/

const eventsCollection = {
    name: "events",
    label: "Events",
    folder: "content/events",
    create: true,
    slug: "{{slug}}",
    editor: { preview: false },
    fields: [
        { label: "Title", name: "title", widget: "string" },
        { label: "Publish Date", name: "publish_date", widget: "datetime" },
        { label: "Event Date", name: "event_date", widget: "datetime" },
        { label: "Description", name: "description", widget: "string" },
        { label: "Body", name: "body", widget: "markdown" }
    ]
};

const gardensCollection = {
    name: "garden-collection",
    label: "Gardens",
    description: "Manage the list of community gardens",
    files: [
        {
            name: "garden-data",
            label: "Our Gardens",
            file: "data/gardens.yml",
            media_folder: "/assets/images/gardens",
            public_folder: "/assets/images/gardens",
            fields: [
                {
                    label: "Gardens",
                    name: "gardens",
                    widget: "list",
                    summary: "{{fields.name}}",
                    fields: [
                        { label: "Garden Name", name: "name", widget: "string" },
                        { label: "Description", name: "description", widget: "markdown" },
                        { label: "Map URL", name: "map_url", widget: "string" },
                        { label: "Cover Image", name: "image", widget: "image" }
                    ]
                }
            ]
        }
    ]
};

const user = window.netlifyIdentity ? window.netlifyIdentity.currentUser() : null;
const roles = user?.app_metadata?.roles || [];
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

const collections = [eventsCollection, gardensCollection];

if (isLocal || roles.includes('admin')) {
    collections.push(menuCollection);
}

const cmsConfig = {
    load_config_file: false,
    local_backend: isLocal,
    public_folder: '/assets/images',
    backend: {
        name: 'git-gateway', branch: 'main', squash_merges: true, url: isLocal ? "http://localhost:8081/api/v1" : undefined
    },
    media_folder: '/assets/images',
    publish_mode: 'editorial_workflow',
    collections: collections
};

window.CMS.init({ config: cmsConfig });
