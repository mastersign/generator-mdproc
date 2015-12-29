# Graphs

You can express relations between sections with _dotex_ notation.
The _dotex_ notation is supported by the [NodeJS] package [MdGraphExtract].

As a demonstration, [Relations] contains some examples how to express relations
between sections of the document or, arbitrary nodes.

The graph visualizations are defined in the file `config/graphs.json`.

## Autograph

At first we use the _autograph_ mode of [MdGraphExtract] to visualize the internal links
of the whole document.

![#img:autograph Autograph of the Document](img-gen/document-relations)

## Dotex

Next we use the _dotex_ mode of [MdGraphExtract].

Here you can see the visualized result of two extracted graphs.
The first is a graph of the default relations, expressed in the document with _dotex_ notation.

![#img:graph-default Default Relations](img-gen/default-relations)

The second shows the default relations plus the specifically selected group _Spine_. 

![#img:graph-selected Selected Group of Relations](img-gen/selected-relations)

<!-- #include relations.md -->