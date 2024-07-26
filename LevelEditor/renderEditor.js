var config = {
    content: [{
      type: 'stack', // Stack
      content: [
        {
          type:'component',
          componentName: 'example',
          componentState: { text: 'Component 1' }
        },
        {
          type:'component',
          componentName: 'example',
          componentState: { text: 'Component 2' }
        },
        {
          type:'component',
          componentName: 'example',
          componentState: { text: 'Component 3' }
        }
      ]
    }]
  };
  
  var myLayout = new GoldenLayout( config, document.getElementById('editor') );
  
  myLayout.registerComponent( 'example', function( container, state ){
    container.getElement().html( '<h2>' + state.text + '</h2>');
  });
  
  myLayout.init();