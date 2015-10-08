/* just for autoreload */

require.context( 'raw!./scripts', true, /^\.\/.*\.js$/ );
require.context( 'raw!./styles', true, /^\.\/.*\.css$/ );
require.context( 'raw!./', true, /^\.\/.*\.html$/ );
