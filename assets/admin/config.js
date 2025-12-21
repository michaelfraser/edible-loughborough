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
            public_folder: "images/gardens",
            fields: [
                {
                    label: "Gardens",
                    name: "gardens",
                    widget: "list",
                    summary: "{{fields.name}}",
                    fields: [
                        { label: "Garden name", name: "name", widget: "string" },
                        { label: "Description", name: "description", widget: "markdown" },
                        { label: "Garden image", name: "image", widget: "image" },
                        { label: "Google map URL", name: "google_map_url", widget: "string" },
                        { label: "Latitude", name: "lat", widget: "number" },
                        { label: "Longtitude", name: "lng", widget: "number" },
                        { label: "Map pin title", name: "map_title", widget: "string" },
                    ]
                }
            ]
        }
    ]
};


const standardFields = [
    { label: "Title", name: "title", widget: "string" },
    { label: "URL Slug", name: "slug", widget: "string", hint: "The URL part, e.g., 'about-us'" },
    { label: "Layout", name: "layout", widget: "hidden", default: "single" },
    { label: "Publish Date", name: "date", widget: "datetime" },
    { label: "Draft Status", name: "draft", widget: "boolean", default: false },
    { label: "Page Content", name: "body", widget: "markdown" }
];

const pagesCollection = {
    name: 'pages',
    label: 'Pages',
    folder: 'content/pages',
    create: true,
    slug: '{{slug}}',
    extension: 'md',
    format: 'yaml-frontmatter',
    fields: standardFields
};

/**
 * 
 * END OF COLLECTION DEFINITIONS
 *
**/

const user = window.netlifyIdentity ? window.netlifyIdentity.currentUser() : null;
const roles = user?.app_metadata?.roles || [];
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

const collections = [eventsCollection, gardensCollection, pagesCollection];

if (isLocal || roles.includes('admin')) {
    collections.push(menuCollection);
}

const cmsConfig = {
    load_config_file: false,
    local_backend: isLocal,
    backend: {
        name: 'git-gateway', branch: 'main', squash_merges: true, url: isLocal ? "http://localhost:8081/api/v1" : undefined
    },
    media_folder: '/assets/images',
    public_folder: 'images',
    publish_mode: 'editorial_workflow',
    collections: collections
};

window.CMS.init({ config: cmsConfig });
