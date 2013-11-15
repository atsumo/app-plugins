/**
 * This is WebLayer Save Plugin like Fireworks weblayer
 * 
 * 設定方法(Mac PhotoShop CS6)
 * 1. /Applications/Adobe Photoshop CS6/Presets の配下に WebLayerSave.jsxを配置
 * 2. PhotoShopを起動(すでに開いてる場合は再起動してください)
 * 3. ファイル>スクリプト>WebLayerSave を実行
 * 
 * 使い方
 * 1.レイヤーに「WebLayer」というグループを作る
 * 2.WebLayer配下に切り出したい大きさの長方形(正方形)を生成
 * 3.レイヤーの名前は保存したいファイル名Pathにする(ex sample/sample001/#/test.png)
 * 4.「#」を入れている部分はPhotoShopファイル自体のファイル名(.psdは除く)に変換されます。
 * 5.WebLayerSaveを実行
 * 
 * @fileName WebLayerSave.jsx
 * @author atsumo
 */

#target photoshop
(function(){
    preferences.rulerUnits = Units.PIXELS;
    const WEB_LAYER_NAME = 'WebLayer';
    
    var fileName = activeDocument.name;
    var cardId = fileName.slice(0, fileName.length - 4);
    
    function WebLayerSave() {
    }

    WebLayerSave.prototype = {
        init: function() {
            var self = this;
            var layers = activeDocument.layers;
            self.width = activeDocument.width;
            self.height = activeDocument.height;
            
            try {
                self.weblayer = layers[WEB_LAYER_NAME];
                self.showWindow();
            } catch (e) {
                app.beep();
                alert('WebLayerがありません', e);
            }
        },
        showWindow: function() {
            var self = this;
            var layers = self.weblayer.artLayers;
            var message = 'これらの{0}つのファイルを書き出していいですか？\n';

            self.targets = [];
            
            var layer;
            for (var i = 0, l = layers.length; i < l; i++) {
                layer = layers[i];
                if (!layer.visible) continue;
                var names = layer.name.split('.');
                var fullName = layer.name.replace('#', cardId)
                message += fullName + '\n';//' [x: ' + layer.bounds[0] + ', y: ' + layer.bounds[1] + ', x: ' + layer.bounds[2] + ', y: ' + layer.bounds[3]  +']\n';
                
                self.targets.push({
                    bounds: layer.bounds,
                    name: fullName,
                    format: names[1]
                });
            }
        
            message = message.replace('{0}', self.targets.length);
        
            var isSave = confirm (message);
            if (isSave) {
                self.weblayer.visible = false;
                self.save();
                self.weblayer.visible = true;
                alert ('保存が完了しました!');
            } else {
                alert('保存をやめました');
            }
            
            return self;
        },
        save: function() {
            var self = this;
            //これ変えたほうがいいと思う
            var path = prompt('保存先のディレクトリをフルパスで入力してください。', activeDocument.path);
            if (!path || path.length === 0) return;
            
            var targets = self.targets;
            var target;
            for (var i = 0, l = targets.length; i < l; i++) {
                target = targets[i];
                self.saveImage(activeDocument, target.bounds, path + '/' +target.name, target.format);
            }
        
            activeDocument.resizeCanvas(0, 0, AnchorPosition.TOPLEFT);
            activeDocument.resizeCanvas(self.width, self.height, AnchorPosition.TOPLEFT);
        },
        saveImage: function(doc, bounds, fileName, format) {
            var self = this;
            var opt;
            switch( format ){
                case 'png':
                    opt = new PNGSaveOptions();
                    opt.interlaced = false;
                    opt.ext = '.png';
                    break;
                default :
                    opt = new JPEGSaveOptions();
                    opt.embedColorProfile = true;
                    opt.formatOptions = FormatOptions.STANDARDBASELINE;
                    opt.matte = MatteType.BACKGROUND;
                    opt.quality = 12;
                    opt.ext = '.jpg';
                    break;
            }
        
            var filePaths = fileName.split('/');
            var folderName = fileName.slice(0, fileName.length - filePaths[filePaths.length - 1].length);
            var folder = new Folder(folderName);
            if (!folder.exists) {
                folder.create();
            }
            var fileObj = new File( fileName);
            
            var x1 = parseInt(bounds[0]);  // 左上 x座標
            var y1 = parseInt(bounds[1]);  // 左上 y座標
            var x2 = parseInt(bounds[2]);  // 右下 x座標
            var y2 = parseInt(bounds[3]);  // 右下 y座標

            var pasteDoc = doc.duplicate();                          
            //pasteDoc.flatten();            // レイヤー結合
            //alert('duplicate');
            // 右と下を削る
            pasteDoc.resizeCanvas(x2,y2,AnchorPosition.TOPLEFT);
            //alert('右と下を切る');
            // 左と上を削る
            var w = x2 - x1 - 2;
            var h = y2 - y1 - 2;
            pasteDoc.resizeCanvas(w,h,AnchorPosition.BOTTOMRIGHT);
            //alert('左と上を削る');
            pasteDoc.saveAs( fileObj, opt, true, Extension.LOWERCASE );
            pasteDoc.close( SaveOptions.DONOTSAVECHANGES ); // 変更を保存せずに閉じる
            pasteDoc = null;
          }
     }

    //alert(documents);
    var plugin = new WebLayerSave();
    plugin.init();
    
})();
