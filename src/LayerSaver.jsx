/**
 * This is WebLayer Save Plugin like Fireworks weblayer
 * 
 * 設定方法(Mac illustrator CS6)
 * 1. /Applications/Adobe illustrator CS6/Presets の配下に WebLayerSave.jsxを配置
 * 2. PhotoShopを起動(すでに開いてる場合は再起動してください)
 * 3. ファイル>スクリプト>LayerSaver を実行
 * 
 * #使い方
 * - 書き出したい大きさのRectのグループレイヤーを作る
 * - 書き出したい名前のレイヤーに書き出し大きさのRectをつくる
 * - レイヤーグループを選択した状態でこのスクリプトを実行する
 *
 * @author atsumo
 */

#target illustrator

(function(){
    var fileName = activeDocument.name;
    
    function WebLayerSave() {
    }

    WebLayerSave.prototype = {
        init: function() {
            var self = this;
            self.width = activeDocument.width;
            self.height = activeDocument.height;
            
            self.selectLayer();
        },
        selectLayer: function() {
          var self = this;
          var layers = activeDocument.layers;
          var isSelectLayer = confirm(activeDocument.activeLayer.name + '以下を書き出しますか？');
            
          if (!isSelectLayer) return;

          self.weblayer = activeDocument.activeLayer;
          
          if (!self.weblayer) {
            alert('Layerグループ名がありません');
            return;
          }

          try {
            self.confirmWindow();
          } catch (e) {
            app.beep();
            alert('保存に失敗しました', e);
            return;
          }
        },
        confirmWindow: function() {
            var self = this;
            var layers = self.weblayer.pathItems;
            var message = 'これらの{0}つのファイルを書き出していいですか？\n';

            //alert(_.keys(layers));

            self.targets = [];
            
            var layer;
            for (var i = 0, l = layers.length; i < l; i++) {
                layer = layers[i];
                var fullName = layer.name;
                message += fullName + '\n';//' [x: ' + layer.bounds[0] + ', y: ' + layer.bounds[1] + ', x: ' + layer.bounds[2] + ', y: ' + layer.bounds[3]  +']\n';
                /**
                    GeometricBounds
                    線巾 (StrokeWidth) がないものとして囲んだ長方形
                    VisibleBounds
                    線巾 (StrokeWidth) 込みで囲んだ場合の長方形
                    ControlBounds
                    ベジェの接線指定などのコントロールポイントを含めてのもの
                    */
                var bounds = layer.visibleBounds;
                self.targets.push({
                    bounds: layer.visibleBounds,
                    name: fullName,
                    format: "png"//names[1]
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
            var artboards = activeDocument.artboards;
            var artboard = artboards[artboards.getActiveArtboardIndex()];

            // アートボードの領域を覚えておく (あとで元に戻す)
       var prevRect = artboard.artboardRect;
            var target;
            for (var i = 0, l = targets.length; i < l; i++) {
                target = targets[i];
                self.saveImage(activeDocument, target.bounds, path + '/' +target.name, target.format);
            }
            // アートボードの領域を元に戻す
            artboard.artboardRect = prevRect;
        },
        saveImage: function(doc, bounds, fileName, format) {
            var self = this;
            var opt;
            switch( format ){
                case 'png':
                    opt = new ExportOptionsPNG24();
                    opt.interlaced = false;
                    opt.artBoardClipping = true;
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
            
            /*
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
            */

            var artboards = doc.artboards;
            var artboard = artboards[artboards.getActiveArtboardIndex()];

            // アートボードの領域を覚えておく (あとで元に戻す)
            var prevRect = artboard.artboardRect;
            // アートボードをエクスポートしたい領域に変更する
            artboard.artboardRect = bounds;
            // エクスポート！
            doc.exportFile(fileObj, ExportType.PNG24, opt);
            
            // アートボードの領域を元に戻す
            artboard.artboardRect = prevRect;
          }
     }

    //alert(documents);
    var plugin = new WebLayerSave();
    plugin.init();
    
})();
