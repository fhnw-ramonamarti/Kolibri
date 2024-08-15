# States of a select component or an option

## `SelectComponent` (ByCallbacks and ByTableValues)

### States of the whole component
- **Closed (geschlossen)**: Only the selected value is visible. If no option is selected the container is empty. The container is always visible and is used as toggle button. This container is sometimes called the detail view in this file. 
- **Opened (offen)**: The container of the closed state is extended with a container containing all possible options. The extending container is sometimes called master view in this file.

- **Normal**: The input select component is not in focus. Interaction are not triggered on this component. 
- **Focused (fokussiert)**: Any event navigated to the element and further interactions are triggered on this component. In this case the component shows the focus with a yellow border. 


### States of an option

- **Selected (ausgewählt)**: The option gets a special marking in the options list. In this case the option gets a yellow background. Each column can only contain one selected option. Is the selected option a value option it is filled in the detail view and send with the form. 
- **Highlighted**: Current option the mouse is over or hovers. The form knows nothing about this state. The confirmation of the highlighted option selects it. It only exists once in the whole component. The only is visible in the master view. 
- **Cursor Position**: Current option the keyboard is at. The form knows nothing about this state. The confirmation of the cursor position selects it. It only exists once in the whole component. The only is visible in the master view. 
