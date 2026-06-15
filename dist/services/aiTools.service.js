"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUICK_SETUP_TEMPLATES = exports.AI_TOOLS = void 0;
exports.AI_TOOLS = [
    // UI/UX Tools
    {
        type: 'function',
        function: {
            name: 'update_theme',
            description: 'Update the website color theme. Available themes: 0=default (light), 1=inverse (dark mode), 2=red, 3=green, 4=purple, 5=yellow. When user asks for "dark theme" or "dark mode", use 1.',
            parameters: {
                type: 'object',
                properties: {
                    theme: {
                        type: 'number',
                        enum: [0, 1, 2, 3, 4, 5],
                        description: 'Theme ID (0=default, 1=inverse, 2=red, 3=green, 4=purple, 5=yellow)',
                    },
                },
                required: ['theme'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'update_layout',
            description: 'Update the website layout template. Available layouts: 0=classic, 1=single_page, 2=magazine, 3=hero',
            parameters: {
                type: 'object',
                properties: {
                    layout: {
                        type: 'number',
                        enum: [0, 1, 2, 3],
                        description: 'Layout ID (0=classic, 1=single_page, 2=magazine, 3=hero)',
                    },
                },
                required: ['layout'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'update_logo_position',
            description: 'Update the logo positioning and alignment',
            parameters: {
                type: 'object',
                properties: {
                    position: {
                        type: 'number',
                        enum: [1, 2, 3],
                        description: 'Logo vertical position: 1=Top, 2=Middle, 3=Bottom',
                    },
                    align: {
                        type: 'number',
                        enum: [1, 2, 3],
                        description: 'Logo alignment: 1=Left, 2=Center, 3=Right',
                    },
                },
                required: ['position'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'update_menu_position',
            description: 'Update the menu positioning and alignment',
            parameters: {
                type: 'object',
                properties: {
                    position: {
                        type: 'number',
                        enum: [1, 2, 3],
                        description: 'Menu vertical position: 1=Top, 2=Middle, 3=Bottom',
                    },
                    align: {
                        type: 'number',
                        enum: [1, 2, 3],
                        description: 'Menu alignment: 1=Left, 2=Center, 3=Right',
                    },
                },
                required: ['position'],
            },
        },
    },
    // Content Display Tools
    {
        type: 'function',
        function: {
            name: 'update_article_display',
            description: 'Update how articles are displayed on the website',
            parameters: {
                type: 'object',
                properties: {
                    displayMode: {
                        type: 'string',
                        enum: ['list', 'grid', 'card', 'magazine'],
                        description: 'Article display mode',
                    },
                    itemsPerPage: {
                        type: 'number',
                        description: 'Number of articles per page',
                    },
                },
                required: ['displayMode'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'update_news_display',
            description: 'Update how news articles are displayed',
            parameters: {
                type: 'object',
                properties: {
                    displayMode: {
                        type: 'string',
                        enum: ['full_width', 'sidebar', 'compact', 'expanded'],
                        description: 'News display mode',
                    },
                },
                required: ['displayMode'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'update_photo_gallery_display',
            description: 'Update how photo galleries are displayed',
            parameters: {
                type: 'object',
                properties: {
                    displayMode: {
                        type: 'string',
                        enum: ['grid', 'masonry', 'carousel', 'slideshow'],
                        description: 'Gallery display mode',
                    },
                },
                required: ['displayMode'],
            },
        },
    },
    // Content CRUD Tools
    {
        type: 'function',
        function: {
            name: 'create_article',
            description: 'Create a new article linked to an existing menu item. A menu must already exist — use create_menu_with_content if no menu exists yet.',
            parameters: {
                type: 'object',
                properties: {
                    title: {
                        type: 'string',
                        description: 'Article title',
                    },
                    description: {
                        type: 'string',
                        description: 'Article short description or summary',
                    },
                    content: {
                        type: 'string',
                        description: 'Article full content (can be HTML)',
                    },
                    langId: {
                        type: 'number',
                        description: 'Language ID (use only lang_id values from the domain language settings)',
                    },
                    menuId: {
                        type: 'number',
                        description: 'Menu ID to link this article to (required — the menu must exist and use the same langId)',
                    },
                },
                required: ['title', 'content', 'langId', 'menuId'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'update_article',
            description: 'Update an existing article',
            parameters: {
                type: 'object',
                properties: {
                    contentId: {
                        type: 'number',
                        description: 'Content ID of the article to update',
                    },
                    title: {
                        type: 'string',
                        description: 'New article title',
                    },
                    description: {
                        type: 'string',
                        description: 'New article description',
                    },
                    content: {
                        type: 'string',
                        description: 'New article content',
                    },
                },
                required: ['contentId'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'delete_article',
            description: 'Delete an article (soft delete, recoverable for 30 days)',
            parameters: {
                type: 'object',
                properties: {
                    contentId: {
                        type: 'number',
                        description: 'Content ID of the article to delete',
                    },
                },
                required: ['contentId'],
            },
        },
    },
    // Combined Menu + Content Tool
    {
        type: 'function',
        function: {
            name: 'create_menu_with_content',
            description: 'Create a new menu item and article together in one step. Use this when the user wants to create content and no suitable menu exists yet. This ensures the menu is created first, then the content is linked to it.',
            parameters: {
                type: 'object',
                properties: {
                    menuName: {
                        type: 'string',
                        description: 'Display name for the menu item',
                    },
                    title: {
                        type: 'string',
                        description: 'Article title',
                    },
                    description: {
                        type: 'string',
                        description: 'Article short description or summary',
                    },
                    content: {
                        type: 'string',
                        description: 'Article full content (can be HTML)',
                    },
                    langId: {
                        type: 'number',
                        description: 'Language ID (use only lang_id values from the domain language settings) — must be the same for menu and content',
                    },
                    parentId: {
                        type: 'number',
                        description: 'Parent menu item ID for submenus (optional)',
                    },
                },
                required: ['menuName', 'title', 'content', 'langId'],
            },
        },
    },
    // News Management
    {
        type: 'function',
        function: {
            name: 'create_news',
            description: 'Create a new news article. Embed additional images inside the description as <img> tags; use the "photo" field for the primary/cover image.',
            parameters: {
                type: 'object',
                properties: {
                    title: {
                        type: 'string',
                        description: 'News title',
                    },
                    shortDescription: {
                        type: 'string',
                        description: 'Short description for listing views',
                    },
                    description: {
                        type: 'string',
                        description: 'Full news content (can be HTML). Embed extra images as <img src="..." style="max-width:100%;height:auto;"> using the image link exactly as the user provided it.',
                    },
                    photo: {
                        type: 'string',
                        description: 'Primary/cover image link for the news article. Pass the image link EXACTLY as the user provided it (e.g. "uploads/1234-abc.jpg"); the backend resolves it to a full URL.',
                    },
                    langId: {
                        type: 'number',
                        description: 'Language ID (use only lang_id values from the domain language settings)',
                    },
                    publishDate: {
                        type: 'string',
                        format: 'date',
                        description: 'Publication date (YYYY-MM-DD format)',
                    },
                },
                required: ['title', 'description', 'langId'],
            },
        },
    },
    // Menu Management
    {
        type: 'function',
        function: {
            name: 'create_menu_item',
            description: 'Create a new menu item',
            parameters: {
                type: 'object',
                properties: {
                    itemName: {
                        type: 'string',
                        description: 'Menu item display name',
                    },
                    itemUrl: {
                        type: 'string',
                        description: 'URL or link for the menu item',
                    },
                    parentId: {
                        type: 'number',
                        description: 'Parent menu item ID (for submenus, optional)',
                    },
                    itemOrder: {
                        type: 'number',
                        description: 'Display order',
                    },
                    langId: {
                        type: 'number',
                        description: 'Language ID (use only lang_id values from the domain language settings)',
                    },
                },
                required: ['itemName', 'itemUrl', 'langId'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'update_menu_item',
            description: 'Update an existing menu item',
            parameters: {
                type: 'object',
                properties: {
                    itemId: {
                        type: 'number',
                        description: 'Menu item ID to update',
                    },
                    itemName: {
                        type: 'string',
                        description: 'New menu item name',
                    },
                    itemUrl: {
                        type: 'string',
                        description: 'New URL',
                    },
                    itemOrder: {
                        type: 'number',
                        description: 'New display order',
                    },
                },
                required: ['itemId'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'delete_menu_item',
            description: 'Delete a menu item',
            parameters: {
                type: 'object',
                properties: {
                    itemId: {
                        type: 'number',
                        description: 'Menu item ID to delete',
                    },
                },
                required: ['itemId'],
            },
        },
    },
    // Banner Management
    {
        type: 'function',
        function: {
            name: 'create_banner',
            description: 'Create a new banner',
            parameters: {
                type: 'object',
                properties: {
                    title: {
                        type: 'string',
                        description: 'Banner title (optional)',
                    },
                    photo: {
                        type: 'string',
                        description: 'Banner image URL or file path',
                    },
                    link: {
                        type: 'string',
                        description: 'Link URL when banner is clicked',
                    },
                    bannerOrder: {
                        type: 'number',
                        description: 'Display order',
                    },
                    langId: {
                        type: 'number',
                        description: 'Language ID (use only lang_id values from the domain language settings)',
                    },
                },
                required: ['photo', 'langId'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'update_banner',
            description: 'Update an existing banner',
            parameters: {
                type: 'object',
                properties: {
                    bannerId: {
                        type: 'number',
                        description: 'Banner ID to update',
                    },
                    title: {
                        type: 'string',
                        description: 'New banner title',
                    },
                    photo: {
                        type: 'string',
                        description: 'New banner image URL',
                    },
                    link: {
                        type: 'string',
                        description: 'New link URL',
                    },
                    bannerOrder: {
                        type: 'number',
                        description: 'New display order',
                    },
                },
                required: ['bannerId'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'delete_banner',
            description: 'Delete a banner',
            parameters: {
                type: 'object',
                properties: {
                    bannerId: {
                        type: 'number',
                        description: 'Banner ID to delete',
                    },
                },
                required: ['bannerId'],
            },
        },
    },
    // SEO Tools
    {
        type: 'function',
        function: {
            name: 'update_seo_metadata',
            description: 'Update SEO metadata for content',
            parameters: {
                type: 'object',
                properties: {
                    contentId: {
                        type: 'number',
                        description: 'Content ID to update SEO for',
                    },
                    metaTitle: {
                        type: 'string',
                        description: 'SEO meta title',
                    },
                    metaDescription: {
                        type: 'string',
                        description: 'SEO meta description',
                    },
                    keywords: {
                        type: 'string',
                        description: 'SEO keywords (comma-separated)',
                    },
                },
                required: ['contentId'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'generate_seo_keywords',
            description: 'Generate SEO keywords from content',
            parameters: {
                type: 'object',
                properties: {
                    contentId: {
                        type: 'number',
                        description: 'Content ID to generate keywords for',
                    },
                },
                required: ['contentId'],
            },
        },
    },
    // Quick Setup Tools
    {
        type: 'function',
        function: {
            name: 'setup_fresh_website',
            description: 'Set up a complete fresh website with language, 4 default menus (Home, About Us, Service, Contact Us), and tailored content for each page. Use this ONLY when the domain has no languages set up yet. You MUST first ask the user about their business before calling this tool.',
            parameters: {
                type: 'object',
                properties: {
                    languageName: {
                        type: 'string',
                        description: 'Full name of the language to create (e.g. "ខ្មែរ", "English", "中文")',
                    },
                    languageFlag: {
                        type: 'number',
                        enum: [0, 1, 2, 3, 4],
                        description: 'Language flag: 0=KH, 1=EN, 2=CH, 3=TH, 4=VN',
                    },
                    businessDescription: {
                        type: 'string',
                        description: 'Summary of what the user told about their business',
                    },
                    homeContent: {
                        type: 'string',
                        description: 'Tailored HTML content for the Home page',
                    },
                    aboutContent: {
                        type: 'string',
                        description: 'Tailored HTML content for the About Us page',
                    },
                    serviceContent: {
                        type: 'string',
                        description: 'Tailored HTML content for the Service page',
                    },
                    contactContent: {
                        type: 'string',
                        description: 'Tailored HTML content for the Contact Us page',
                    },
                    templateType: {
                        type: 'string',
                        enum: ['business', 'portfolio', 'blog', 'organization'],
                        description: 'Best-matching template type based on the business description (default: business)',
                    },
                },
                required: ['languageName', 'languageFlag', 'businessDescription', 'homeContent', 'aboutContent', 'serviceContent', 'contactContent'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'apply_quick_setup_template',
            description: 'Apply a pre-built website template for quick setup',
            parameters: {
                type: 'object',
                properties: {
                    templateType: {
                        type: 'string',
                        enum: ['business', 'portfolio', 'blog', 'organization'],
                        description: 'Template type to apply',
                    },
                },
                required: ['templateType'],
            },
        },
    },
];
exports.QUICK_SETUP_TEMPLATES = {
    business: {
        theme: 0, // default
        layout: 0, // classic
        articleDisplay: 'list',
        newsDisplay: 'sidebar',
        logoPosition: 2, // 1=Top, 2=Middle(center), 3=Bottom
        menuPosition: 1, // 1=Top, 2=Middle, 3=Bottom
    },
    portfolio: {
        theme: 4, // purple
        layout: 3, // hero
        articleDisplay: 'card',
        photoGalleryDisplay: 'masonry',
        logoPosition: 1, // 1=Top(left), 2=Middle, 3=Bottom
        menuPosition: 1, // 1=Top, 2=Middle, 3=Bottom
    },
    blog: {
        theme: 0, // default
        layout: 2, // magazine
        articleDisplay: 'magazine',
        newsDisplay: 'grid',
        logoPosition: 2, // 1=Top, 2=Middle(center), 3=Bottom
        menuPosition: 1, // 1=Top, 2=Middle, 3=Bottom
    },
    organization: {
        theme: 3, // green
        layout: 0, // classic
        articleDisplay: 'card',
        documentDisplay: 'table',
        logoPosition: 1, // 1=Top(left), 2=Middle, 3=Bottom
        menuPosition: 1, // 1=Top, 2=Middle, 3=Bottom
    },
};
//# sourceMappingURL=aiTools.service.js.map