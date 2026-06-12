# AI Chat Phrases — Complete User Prompt Guide

Every phrase a user can say to the Khmerbiz CMS AI assistant, organized by capability. The AI has **34 tools** across 12 categories.

---

## 1. Quick Setup & Templates (2 tools)

### Setup Fresh Website — `setup_fresh_website`
> Only works if the website has no existing data (no language, no menus, no content). Requires admin (user_level ≤ 1).

- "Set up my website for the first time"
- "Help me create a brand new website"
- "I just registered — help me set up my site"
- "Initialize my website, it's a business called …"
- "Create a website for my restaurant"
- "Set up a fresh website for my organization"
- "Build me a blog from scratch"
- "I want to start a portfolio site"
- "Create my website with Khmer language"
- "Set up my site in English"

### Apply Template — `apply_quick_setup_template`
> Applies a pre-built template with preset theme, layout, and display settings.

- "Apply the business template to my site"
- "Use the portfolio template"
- "Set up my site like a blog"
- "Apply the organization template"
- "Switch my site to the business template"
- "Try the portfolio look"
- "What templates are available?"
- "Show me the template options"

**Templates:**

| Template | Theme | Layout | Article Display | News Display |
|----------|-------|--------|-----------------|--------------|
| Business | Default (light) | Classic | List | Sidebar |
| Portfolio | Purple | Hero | Card | — (Gallery: Masonry) |
| Blog | Default (light) | Magazine | Magazine | Grid |
| Organization | Green | Classic | Card | — |

---

## 2. Theme & Appearance (2 tools)

### Update Theme — `update_theme`
- "Change the theme to dark mode"
- "Switch to the red theme"
- "Apply the green theme"
- "Use the purple theme"
- "Set the yellow theme"
- "Go back to the default/light theme"
- "What themes can I choose from?"
- "Make my site look dark"
- "Give my site a red accent"

**Themes:** 0 = Default (Light), 1 = Inverse (Dark), 2 = Red, 3 = Green, 4 = Purple, 5 = Yellow

### Update Layout — `update_layout`
- "Change the layout to classic"
- "Switch to single-page layout"
- "Use the magazine layout"
- "Set the hero layout"
- "Show me available layouts"
- "Make it a one-page website"
- "Use the hero-style layout"

**Layouts:** 0 = Classic, 1 = Single Page, 2 = Magazine, 3 = Hero

---

## 3. Logo & Menu Positioning (2 tools)

### Update Logo Position — `update_logo_position`
- "Move the logo to the top-left"
- "Center the logo at the top"
- "Put the logo on the right side"
- "Move the logo to the middle of the page"
- "Change the logo alignment to center"
- "Reposition the logo to bottom-right"
- "Put the logo at the bottom center"

**Positions:** 1 = Top, 2 = Middle, 3 = Bottom
**Alignment:** 1 = Left, 2 = Center, 3 = Right

### Update Menu Position — `update_menu_position`
- "Move the navigation menu to the top"
- "Put the menu on the left side"
- "Center the navigation bar"
- "Align the menu to the right"
- "Move the menu to the bottom"
- "Reposition the navigation"

---

## 4. Content Display Modes (3 tools)

### Article Display — `update_article_display`
- "Show articles in a list view"
- "Display articles as a grid"
- "Use card layout for articles"
- "Switch to magazine style for articles"
- "Change how articles are displayed"

**Modes:** list, grid, card, magazine

### News Display — `update_news_display`
- "Show news in full-width mode"
- "Display news with a sidebar layout"
- "Use compact news display"
- "Switch to expanded news view"
- "Change the news layout"

**Modes:** full_width, sidebar, compact, expanded

### Photo Gallery Display — `update_photo_gallery_display`
- "Display photos in a grid"
- "Use masonry layout for the gallery"
- "Show photos as a carousel"
- "Set the gallery to slideshow mode"
- "Change how photos are shown"

**Modes:** grid, masonry, carousel, slideshow

---

## 5. Menu Management (3 tools)

### Create Menu Item — `create_menu_item`
- "Create a menu called 'About Us'"
- "Add a new menu item named 'Services'"
- "Create a 'Contact' menu"
- "Add a submenu under 'About Us' called 'Our Team'"
- "Create a menu with the URL '/products'"
- "Add 'Blog' to the navigation"
- "Create a Khmer menu called 'អំពីយើង'"

### Update Menu Item — `update_menu_item`
- "Rename 'About Us' to 'About Company'"
- "Change the URL of the 'Services' menu"
- "Update the name of menu item 5"
- "Change the menu order"

### Delete Menu Item — `delete_menu_item` ⚠️ Confirmation required
- "Delete the 'Old Page' menu"
- "Remove the 'Test' menu item"
- "I want to delete the 'Events' menu"
- "Remove menu ID 3"

---

## 6. Content / Article CRUD (4 tools)

### Create Article — `create_article`
> Requires an existing menu item to link to. Menu and content language must match.

- "Create a new article titled 'Welcome to Our Company'"
- "Add an article about our services under the 'Services' menu"
- "Write an article about our history and link it to the 'About' page"
- "Create a photo gallery page under 'Projects'"
- "Add a video section under 'Media'"
- "Create a document page for downloads"

### Create Menu with Content — `create_menu_with_content`
> Creates menu + article in one step (menu first, then content). Use this when the menu doesn't exist yet.

- "Create a new page called 'About' with content about our company"
- "Add a 'Services' page and write about what we offer"
- "Create 'Contact' page with our address and phone number"
- "Make a new 'Team' page with profiles of our team members"
- "Add a 'Products' page with product descriptions"
- "Create a page called 'Projects' and add a photo gallery"

### Update Article — `update_article`
> Creates a version backup before updating (supports rollback).

- "Update the 'Welcome' article with new information"
- "Edit the content on the 'About Us' page"
- "Change the title of the 'Services' article"
- "Add more details to the 'Contact' page"
- "Rewrite the article on the 'Home' page"
- "Update article ID 5 with this new content"

### Delete Article — `delete_article` ⚠️ Confirmation required
> Soft delete — 30-day recovery window.

- "Delete the 'Old News' article"
- "Remove the article about 'Events'"
- "I want to delete article ID 3"
- "Delete the 'Test Page' content"

---

## 7. News Management (1 tool)

### Create News — `create_news`
- "Create a news article titled 'Grand Opening'"
- "Add a news post about our upcoming event"
- "Write a news article about the new product launch"
- "Post news about our company expansion"
- "Create a news story about the holiday sale"
- "Add breaking news with today's publish date"
- "Create a news article in Khmer"
- "Write a short news update about the team"

> Note: News editing, publishing, unpublishing, and deletion are available via the AI's conversation context but use direct API actions rather than dedicated tools.

---

## 8. Banner Management (3 tools)

### Create Banner — `create_banner`
- "Create a new banner for the homepage"
- "Add a banner using the image I uploaded"
- "Create a promotional banner with title 'Sale'"
- "Add a banner with a link to the 'Products' page"

### Update Banner — `update_banner`
- "Update the banner image to a new photo"
- "Change the banner title to 'New Collection'"
- "Update the link on banner ID 2"
- "Change banner order"

### Delete Banner — `delete_banner` ⚠️ Confirmation required
- "Delete the old banner"
- "Remove banner ID 3"
- "Delete the promotional banner"

---

## 9. SEO Optimization (2 tools)

### Update SEO Metadata — `update_seo_metadata`
> Admin only (user_level ≤ 1). Max 5 SEO operations per day.

- "Update the SEO title for my website"
- "Set the meta description to 'Best services in Cambodia'"
- "Add SEO keywords to the 'About' page"
- "Optimize the SEO for article ID 10"
- "Set custom meta title and description for the 'Services' page"
- "Update the SEO metadata for my homepage"

### Generate SEO Keywords — `generate_seo_keywords`
> Auto-generates keywords from existing content. Max 10 keywords. 5 operations/day.

- "Generate SEO keywords for my site"
- "Suggest keywords based on the 'Services' content"
- "Auto-generate keywords for article ID 5"
- "What keywords should I use for SEO?"
- "Analyze my content and suggest keywords"
- "Generate keywords for the 'About Us' page"

---

## 10. Language & Localization

### Language Management (via AI conversation context)
- "Add Khmer language to my site"
- "Add English as a language"
- "Set Khmer as the default language"
- "Switch the default language to English"
- "Remove the Chinese language option"
- "What languages does my site support?"
- "Show me my active languages"

### Multilingual Content
- "Create the 'About' page in Khmer"
- "Add an English version of the 'Services' menu"
- "Create content in Thai language"
- "Write the 'Contact' page in Chinese"
- "Add Vietnamese content for the 'Home' page"

**Language Flags:** 0 = Khmer, 1 = English, 2 = Chinese, 3 = Thai, 4 = Vietnamese

---

## 11. Settings & Configuration

### General Settings
- "Change my website title to 'My Business'"
- "Update the footer text to '© 2026 My Company'"
- "Set the background color/image to …"
- "Add Google Analytics tracking ID UA-XXXXX"
- "Add a chat script to my website"
- "Update the page style"
- "Change the screen mode"

### Logo Settings
- "Update my website logo"
- "Set a mobile logo"
- "Change the logo position and alignment"

### Social Media Links
- "Add a Facebook link to my site"
- "Connect my YouTube channel"
- "Add my LinkedIn profile"
- "Add a Twitter/X link"
- "Add a Google link"
- "Remove the Google social media link"
- "Update the Facebook URL"
- "Show me my social media links"

**Social Types:** 1 = Facebook, 2 = Google, 3 = YouTube, 4 = LinkedIn, 5 = Twitter

---

## 12. Confirmation & Destructive Actions

### When AI asks for confirmation before delete:
- "Yes, go ahead and delete it"
- "Confirm the deletion"
- "Yes, I'm sure — delete it"
- "Confirmed, proceed"

### Reject / Cancel:
- "No, cancel that"
- "Don't delete it"
- "Actually, keep it"
- "Cancel the operation"
- "Never mind"

### Rollback / Undo Operations:
- "Undo the last change"
- "Rollback the theme update"
- "Restore the previous version of the article"
- "Revert my last operation"
- "Undo the last thing you did"
- "Rollback operation [ID]"
- "Can I undo what just happened?"

> **Rollback supported:** Create → delete the created resource, Update → restore from version history
> **Rollback NOT supported:** Delete operations (data already removed)

---

## 13. Status & Information Queries

### Website Status
- "What's the current status of my website?"
- "Show me my current theme and layout"
- "What content do I have?"
- "How many menus do I have?"
- "List my pages"
- "What banners are on my site?"
- "What languages are active?"
- "Show me my website settings"

### AI Usage
- "How many questions have I asked today?"
- "What's my daily AI usage?"
- "How many questions do I have left?"

### Content Versions
- "Show me the version history for article ID 5"
- "What changes were made to the 'About' page?"
- "Get the content versions for this article"

### Operation History
- "Show me my recent operations"
- "What did the AI change on my site?"
- "Show the AI operation history"
- "What was the last thing you did?"

### Health Check
- "Is the AI service working?"
- "Check AI health"

---

## 14. Help & Guidance

- "What can you do?"
- "Help me set up my website"
- "What are the available themes?"
- "What layouts can I choose?"
- "How do I create a new page?"
- "How do I add a news article?"
- "Explain the display options"
- "What templates are available?"
- "How do I change my site's look?"
- "Guide me through the setup process"

---

## 15. Multi-Step / Combined Requests

Users can combine multiple operations in one message (up to 3 tool calls per message):

- "Set up a business website with dark theme, classic layout, and create an About Us page"
- "Create a menu called 'Services' and add 3 articles under it"
- "Change the theme to purple, switch to hero layout, and move the logo to center"
- "Add Khmer language, create menus in Khmer, and add content for each"
- "Apply the blog template and create my first news post"
- "Update the theme to dark, add a banner, and write a news article about the redesign"
- "Create 'Home', 'About', 'Services', 'Contact' pages with content for each"
- "Set up my website with the business template and write content about my coffee shop"
- "Change the article display to grid, news display to compact, and gallery to masonry"

---

## 16. Conversational / General Chat

The AI also handles general conversation and contextual questions:

- "I want to make my website look more professional"
- "My website needs a modern design"
- "Can you help me organize my website content?"
- "What's the best layout for a restaurant website?"
- "I need a website for my school"
- "Make my site mobile-friendly"
- "I want to add more pages to my site"
- "Help me write content for my business"
- "What should I put on my homepage?"
- "Suggest content for a real estate website"
- "I don't know where to start"
- "What do you recommend for a small business website?"

---

## Limits & Constraints

| Limit | Value |
|-------|-------|
| Daily questions | 100 per user per domain |
| Max tool calls per message | 3 |
| Message length | 5,000 characters |
| Content size | 50 KB max |
| Min content length | 10 characters after sanitization |
| SEO operations | 5 per day |
| SEO keywords | Max 10 per generation |
| Confirmation timeout | 5 minutes |
| Conversation memory | 20 messages, 24-hour TTL |
| Job timeout | 10 minutes |
| Delete recovery | 30-day soft delete |

---

## Permission Levels

| Capability | Normal User | Web Admin | Super Admin |
|-----------|:-----------:|:---------:|:-----------:|
| Create content, menus, banners | ✅ | ✅ | ✅ |
| Update content, menus, banners | ✅ | ✅ | ✅ |
| Delete content, menus, banners | ❌ | ✅ | ✅ |
| Setup fresh website | ❌ | ✅ | ✅ |
| SEO tools | ❌ | ✅ | ✅ |
| Apply templates | ❌ | ✅ | ✅ |
| Rollback operations | ✅ | ✅ | ✅ |
| Confirm/reject actions | ✅ | ✅ | ✅ |

---

## Content Types

| Type | Code | Description |
|------|------|-------------|
| Article | 0 | Standard article/page content |
| Photo Gallery | 1 | Image gallery with items |
| Video | 2 | Video section with URLs |
| Document | 3 | Document/file downloads |
| Map | 4 | Map with coordinates |
| News | 5 | News/blog articles |

---

## HTML Content Rules

All AI-generated HTML content follows these rules:
- ✅ Mobile-responsive (`max-width: 100%`, no fixed pixel widths)
- ✅ Flexbox/Grid layout only
- ✅ All `<img>` tags must have `max-width:100%; height:auto;`
- ✅ Simple semantic HTML
- ❌ No `<table>` for layout
- ❌ No `<style>` or `<script>` tags
- ❌ No inline styles with fixed dimensions
