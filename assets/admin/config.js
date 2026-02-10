CMS.registerEditorComponent({
  id: "hugo-img",
  label: "Image Picker",
  fields: [
    { name: "src", label: "Image", widget: "image" },
    { name: "alt", label: "Alt Text", widget: "string" },
    { name: "width", label: "Width (e.g. 600x)", widget: "string", default: "800x" }
  ],

  pattern: /{{<img src="([^"]*)" alt="([^"]*)" width="([^"]*)" >}}/,
  fromBlock: function(match) {
    return {
      src: match[1],
      alt: match[2],
      width: match[3]
    };
  },
  toBlock: function(obj) {
    return `{{<img src="${obj.src}" alt="${obj.alt}" width="${obj.width}" >}}`;
  },
  toPreview: function(obj, getAsset) {
    const asset = getAsset(obj.src);
    return `<img src="${asset || ''}" style="max-width:100%; height:auto;" alt="${obj.alt}">`;
  }
});

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

const initCMS = (user) => {
    const roles = user?.app_metadata?.roles || [];
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const collections = [eventsCollection, gardensCollection, pagesCollection];

    if (isLocal || roles.includes('admin')) {
        collections.push(menuCollection);
    }

    window.CMS.init({
        config: {
            load_config_file: false,
            local_backend: isLocal,
            backend: {
                name: 'git-gateway',
                repo: 'michaelfraser/edible-loughborough',
                branch: 'main',
                squash_merges: true,
            },
            media_folder: '/assets/images',
            public_folder: 'images',
            publish_mode: 'simple',
            collections: collections
        }
    });
};

const run = () => {
    const user = window.netlifyIdentity.currentUser();

    if (user) {
        initCMS(user);
    } else {
        window.netlifyIdentity.open();
        window.netlifyIdentity.on("login", (user) => {
            window.netlifyIdentity.close();
            initCMS(user);
        });
    }
};

if (window.netlifyIdentity) {
    window.netlifyIdentity.on("init", () => run());
}