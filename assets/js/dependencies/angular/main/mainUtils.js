if (!window.x) {
    x = {};
}

x.Selector = {};
x.Selector.getSelected = function () {
    var t = '';
    if (window.getSelection) {
        t = window.getSelection();
    } else if (document.getSelection) {
        t = document.getSelection();
    } else if (document.selection) {
        t = document.selection.createRange().text;
    }
    return t;
}


function setDate() {
    var data = new Date();
    var minutes = data.getMinutes();
    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    return '' + data.getHours() + ':' + minutes + '';
}

function orderByDate(arr, dateProp) {
    return arr.slice().sort(function (a, b) {
        return a[dateProp] < b[dateProp] ? -1 : 1;
    });
}

function isEmpty(value) {
    var isEmptyObject = function (a) {
        if (typeof a.length === 'undefined') {
            var hasNonempty = Object.keys(a).some(function nonEmpty(element) {
                return !isEmpty(a[element]);
            });
            return hasNonempty ? false : isEmptyObject(Object.keys(a));
        }

        return !a.some(function nonEmpty(element) {
            return !isEmpty(element);
        });
    };
    return (
        value == false
        || typeof value === 'undefined'
        || value == null
        || (typeof value === 'object' && isEmptyObject(value))
    );
}

navigator.browserSpecs = (function () {
    var ua = navigator.userAgent, tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return { name: 'IE', version: (tem[1] || '') };
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if (tem != null) return { name: tem[1].replace('OPR', 'Opera'), version: tem[2] };
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return {
        name: M[0], version: M[1]
    };
})();