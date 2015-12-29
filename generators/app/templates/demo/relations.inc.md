# Relations

You can express nodes and relations inside of HTML comments `<!-- ... -->`.

A node startes with the keyword `@node` or `@n`.
You can optionally add the title of a node. If you do not specify a node title,
the title is derived from the next preceding headline.

````markdown
## Chapter 3
<!-- @node -->
<!-- @n Another Node -->
````

To express a relation from one node to another, you can use the keyword `@edge` or `@e`.
The complete syntax is `@edge from -> to` or `@edge -> to`. If you skip the from node title,
then the title of the last specified node is used.

````markdown
## Chapter 4
<!-- 
@e -> Chapter 3
@edge Another Node -> Chapter 4
-->
````

You can associate a node or a relation with a type, to control the styling.
To specify a node or an edge of specifiy type, add the type in angle brackets.

````markdown
<!--
@node My Node <node-type-1>
@edge My Node -> Your Node <edge-type-1>
-->
````

To adjust the visualization of a graph, you can use [Graphviz] attributes.
The complete list of attributes can be found in the
[Documentation](http://www.graphviz.org/content/attrs) of Graphviz.
Colors can be defined as HTML typical RGB or RGBA hexadecimal codes like `#FF80C2`
or with a named color from the [X11 color scheme](http://www.graphviz.org/content/color-names).

You can define attributes as default for the graph, for nodes and edges,
and you can define attributes for node types and edge types.
Default attributes and types must be defined before the nodes and edges,
so best put them in the head of the document, or even better, in a separate file,
which is included at the beginning of the document.

````markdown
<!--
@node-type node-type-1: shape=rect, style="filled,rounded" color=#008080, fillcolor=#FFF0A080
@edge-type edge-type-1: arrowsize=2.0, arrowhead=diamond
-->
````

Nodes and edges can be tagged, and selected in groups for subgraphs.

````markdown
<!-- @node #GroupA #GroupB Node Title -->
````

For more on the syntax take a look at the documentation of [MdGraphExtract].

<!--
@node-attributes shape=rect, style=filled, color=#404040, fillcolor=#A0D0FF, fontcolor=#000000 
@node-type arm: shape=ellipse, fillcolor=#FFA060
@node-type leg: shape=rect, style="filled,rounded", fillcolor=#80D040
@edge-type spine: arrowhead=odot, arrowsize=1.5
-->

## Upper Body

The upper body spans the _Head_, the _Shoulder_, the arms, and the hands.
Additionally, it contains the _Belly_.

### Head
<!-- @node Head: shape=diamond, fillcolor=#FFF080 -->
<!-- @edge #Spine Head -> Shoulder <spine> -->

The _Head_ is only connected to the _Shoulder_, via the spine.

### Shoulder
<!-- @node shape=house -->
<!-- @edge #Spine -> Belly <spine> -->
<!-- @edge -> Left Arm -->
<!-- @edge -> Right Arm -->

The _Shoulder_ is connected to the arms and the _Belly_, via the spine.

### Left Arm
<!-- @node <arm> -->
<!-- @node Left Hand <arm> -->
<!-- @edge -> Left Hand -->

The _Left Arm_ is connected to the _Left Hand_.
The _Left Hand_ is not represented with its own section.

### Belly
<!-- 
@node shape=octagon, width=1.5
@edge #Spine -> Hips <spine>
-->

The _Belly_ is connected to the _Hips_, via the spine.

### Right Arm
<!--
@node <arm>
@node Right Hand <arm>
@edge -> Right Hand
-->

The _Right Arm_ is connected to the _Right Hand_.
The _Right Hand_ is not represented with its own section.

## Lower Body

The _Lower Body_ spand the _Hips_, the _Legs_ and the _Feet_. 

### Hips
<!-- @n shape=invtrapezium -->
<!-- @e -> Left Leg -->
<!-- @e -> Right Leg -->

The _Hips_ is connected to the _Left Leg_ and the _Right Leg_.

### Left Leg
<!-- @n <leg> -->
<!-- @e -> Left Foot -->
<!-- @n Left Foot <leg> -->

The _Left Leg_ is connected to the _Left Foot_.
The _Left Foot_ is not represented with its own section.

### Right Leg
<!--
@n <leg>
@n Right Foot <leg>
@e -> Right Foot
-->

The _Right Leg_ is connected to the _Right Foot_.
The _Right Foot_ is not represented with its own section.
