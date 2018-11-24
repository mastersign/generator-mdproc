---
title: <%= projectTitle %>
subtitle: <%= projectSubTitle %>
author: <%= authorName %>
creator:
 - role: Author
   name: <%= authorName %>
   email: <%= authorEmail %>
lang: en-US
abstract: |
  This demo document demonstrates features of _MdProc_,
  like includes of text, data, and code, or data queries
  on the document structure, or graph generation from the
  document structure or explicit nodes and edges.
  Furthermore, it shows the use of numbered figures,
  different kinds of links, and state badges to display
  the progression on units of work.
long-toc: true
<% if (supportCitation) { %>link-citations: true
reference-section-title: References
<% } %>---

This document demonstrates various features of the _MdProc_ environment.

<!-- #include inc/includes.md -->

<!-- #include inc/images.md -->
<% if (supportCitation) { %>
<!-- #include inc/citations.md -->
<% } %><% if (bibleQuotes) { %>
<!-- #include inc/biblequote.md -->
<% } %>
<!-- #include inc/query.md -->

<!-- #include inc/graph.md -->

<!-- #include inc/links.md -->

<!-- #include inc/badges.md -->
