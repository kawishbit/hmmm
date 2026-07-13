## Overview 
Project Name: Hmmm
Short Description: A PWA Astro app/tool for creating images of quotes with a background image and text overlay.

## Tech Stack 
- Astro JS 
- Vue integration
- Tailwind CSS 
- Vercel
- Bun for tool
- Node for runtime
- Typescript 
- PWA implementation with service workers and offline support

## Features 
- Input quote text and author name
- Select background image from a gallery or upload your own
- Customize text style, font, color, and size
- Adjust text position and alignment
- Pick layout (1:1, 16:9, 4:5, etc.)
- (To be decided) Use pretext by Cheng Lou to determine whether to truncate text or not. Preferably I don't want to truncate text. so if we have a quote that has more than 300 words. I want to display all. However, we need to consider the layout and how it will look. So we can use pretext to determine whether to truncate or not. We can also put constraint on whether this layout is suitable for this quote or not. If not, we can suggest a different layout.
- Support for max 300 words for quotes (whether english, arabic, chinese or any other language). If the quote is more than 300 words, we can suggest a different layout or truncate the text. We can also use pretext to determine whether to truncate or not.
- Blur slider for background image
- Preset filters for background image (e.g., grayscale, sepia, etc.)
- Quote templates for quick creation
- There is a scenario where i want to integrate this with another website that has quotes. I want users in that website to be able to click a button and be redirected to this tool with the quote text and author name pre-filled. So we need to have a way to pass the quote text and author name as query parameters in the URL. However, one of the issues that we might face is that the text is too long or it contains special characters. So put this into considerations as well.
- Use DESIGN.md to determine the style of the website 
- Implement themes for the website. 

## Constraints
- No login / user authentication. 
- No database preferably. 

## Tasks
- Create a plan to build the app/tool.
- Separate the plan into phases and each phase has its own markdown file. 
- Interview me if you have any questions about the requirements. 