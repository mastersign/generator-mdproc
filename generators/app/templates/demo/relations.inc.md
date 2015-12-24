# Relations

You can express nodes and relations inside of HTML comments `<!-- ... -->`.

A node startes with the keyword `@node` or `@n`.
You can optionally add the title of a node. If you do not specify a node title,
the title is derived from the next preceding headline.

To express a relation from one node to another, you can use the keyword `@edge` or `@e`.
THe complete syntax is `@edge from -> to` or `@edge -> to`. If you skip the from node title,
then the title of the last specified node is used.

You can associate a node or a relation with a type, to control the styling.
To specify a node or an edge of specifiy type, add the type in angle brackets:
`@node My Node <node-type-1>` or `@edge My Node -> Your Node <edge-type-1>`. 

To adjust the visualization of a graph, you can use [Graphviz] attributes.
The complete list of attributes can be found in the
[Documentation](http://www.graphviz.org/content/attrs) of Graphviz.
Colors can be defined as HTML typical RGB or RGBA hexadecimal codes like `#FF80C2`
or with a named color from the [X11 color scheme](http://www.graphviz.org/content/color-names).

You can define attributes as default for the graph, for nodes and edges,
and you can define attributes for node types and edge types.
Default attributes and types must be defined before the nodes and edges,
so best put them in the head of the document.

For more on the syntax take a look at the documentation of [MdGraphExtract].

<!--
@node shape=ellipse, style=filled, color=#404040, fillcolor=#D0D0D0, fontcolor=#000000 
@node-type arm: style=rect, style="filled,rounded"
@node-type leg: style=rect, style=filled
-->

## Upper Body

### Head
<!-- @node Head -->
<!-- @edge Head -> Shoulder -->

### Shoulder
<!-- @node -->
<!-- @edge -> Belly -->

### Left Arm
<!-- @node <arm> -->
<!-- @edge Left Arm -> Shoulder -->
<!-- @node Left Hand <arm> -->
<!-- @edge -> Left Arm -->
<!-- @edge -> Right Hand <touch> -->

### Right Arm
<!--
@node <arm>
@edge -> Shoulder
@node Right Hand <arm>
@edge -> Right Arm
-->

### Belly
<!-- @node -->

## Lower Body

### Hips
<!-- @n -->
<!-- @e -> Belly -->

### Left Leg
<!-- @n <leg> -->
<!-- @e -> Hips -->
<!-- @n Left Foot <leg> -->
<!-- @e -> Left Leg -->

### Right Leg
<!--
@n <leg>
@e -> Hips
@n Right Foot
-->
