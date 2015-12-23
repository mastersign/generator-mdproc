# Includes

The [NodeJS] package [MdInclude] extends the [Markdown] syntax with the capability
to include additional documents.

You can write a HTML comment `<!-- #<command> <path> -->` and it will be replaced
with the content of the referenced file.

## Markdown

The `include` command just includes the text of the referenced file as it is,
e.g. `#include inc/chapter_1.md`.

This document is structured in a way, that every main chapter is stored in its own file.
The main document `index.md` then includes all the chapter files.

## Tables

You can include CSV files, which will appear as tables: `#csv data/table1.csv`.

And here is a live example:

<!-- #csv ../data/table1.csv -->

## Code

And you can include code blocks from external files: `#code code/example.js`.

And here a live example:

<!-- #code ../code/example.js -->

The syntax highlighting is guessed from the file name by default, but can also be given explicitly.
See the [MdInclude] documentation for details.
