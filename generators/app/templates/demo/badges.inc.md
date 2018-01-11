# Badges

Badges are styled [text spans]{.badge .success} or

::: {.badge .warning}
**Blocks**

With arbitrary content.
:::

## States

You can mark a section, with a comment containing `#state <state>`,
as in one of the following states:

* `todo` <!-- #state todo -->
* `selected` <!-- #state selected -->
* `open` <!-- #state open -->
* `in-progress` <!-- #state in-progress -->
* `closed` <!-- #state closed -->
* `invalid` <!-- #state invalid -->
* `failed` <!-- #state failed -->
* `rejected` <!-- #state rejected -->

## Generic

More generic, you can insert badges with a comment containing `#badge <type> <some text>`,
    with one of the following types:

* `highlight` <!-- #badge highlight Badge Text -->
* `success` <!-- #badge success Badge Text -->
* `info` <!-- #badge info Badge Text -->
* `warning` <!-- #badge warning Badge Text -->
* `error` <!-- #badge error Badge Text -->
* `active` <!-- #badge active Badge Text -->
* `passive` <!-- #badge passive Badge Text -->
