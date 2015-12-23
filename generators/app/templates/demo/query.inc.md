# Data Queries

Because of the [NodeJS] packages [MdData] and [MdQuery], you can query structured data from the document.

## Lists

Here is a list with all recepies:

<!-- #data-list /Data/Recepies/* -->

And here is a list with birthday dates:

<!--
#data-list /Data/Contacts/*
#column Name: name(.)
#column Birthday: value(Birthday)
-->

## Tables

You can build simple tables with a name and a value column:

<!-- #data-table /Data/Recepies/*/* -->

And you can build more complex tables, e.g. an address table:

<!--
#data-table /Data/Contacts/*
#column Name: name(.)
#column Email: value(Email)
#column City: value(Address/City)
#column Street: value(Address/Street) 
-->
