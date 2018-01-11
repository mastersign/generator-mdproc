---
title: <%= projectTitle %>
subtitle: Documentation
author: <%= authorName %>
creator:
- role: Author
  name: <%= authorName %>
  email: <%= authorEmail %>
lang: en-US
<% if (supportCitation) { %>link-citations: true
reference-section-title: References
<% } %>---

This is the documentation for the project _<%= projectName %>_.
