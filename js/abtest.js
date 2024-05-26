var execTime = new Date();
var loadABtest = true;
var ua = (function() {
    return {
        isFirefox: 'MozAppearance' in document.documentElement.style,
        isChrome: navigator.userAgent.toLowerCase().search(/chrome/) != -1,
        isSafari: !window.chrome && 'WebkitAppearance' in document.documentElement.style,
        isAndroid: navigator.userAgent.toLowerCase().search(/android/) != -1
    };
})();

function saveBlockClickLog(blockId) {
    var now = new Date();
    if (now.getTime() - execTime.getTime() > 500) {
        execTime = now;
        if (ua.isChrome || ua.isFirefox || ua.isSafari || ua.isAndroid) {
            jQuery.ajax({
                url: "abtest/blockclick.aspx",
                async: false,
                timeout: 1000,
                cache: false,
                type: "post",
                data: {
                    blockId: blockId
                }
            });
        } else {
            jQuery.ajax({
                url: "abtest/blockclick.aspx",
                cache: false,
                type: "post",
                data: {
                    blockId: blockId
                }
            });
        }
    }
}
jQuery(document).ready(function() {
    if ("blockIdList" in window) {
        var blockIds = blockIdList.split(",");
        jQuery.each(blockIds, function(index, blockId) {
            var blockName = "#block_of_" + blockId;
            jQuery(blockName).delegate("a:not(.item_history_link_,.logout_link_)", "click", {
                blockId: blockId
            }, function(event) {
                saveBlockClickLog(event.data.blockId);
            });
            jQuery(blockName).delegate("form", "submit", {
                blockId: blockId
            }, function(event) {
                saveBlockClickLog(event.data.blockId);
            });
            jQuery(blockName).delegate("input[type=button]", "click", {
                blockId: blockId
            }, function(event) {
                saveBlockClickLog(event.data.blockId);
            });
        });
    }
});