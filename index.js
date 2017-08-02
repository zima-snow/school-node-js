; (function (f) {
  var g;
  if (typeof window !== "undefined") {
    g = window;
  } else if (typeof global !== "undefined") {
    g = global;
  } else if (typeof self !== "undefined") {
    g = self;
  } else {
    g = this;
  }
  f(g);
})(function (global) {
    var cult= {
      fio: {
        regex: /^[а-яё]+(-[а-яё]+)? [а-яё]+ [а-яё]+$/i,
      },
      email: {
        regex: /^([\da-zа-яё_\.-])+@(ya.ru|yandex.ru|yandex.ua|yandex.by|yandex.kz|yandex.com)$/i,
      },
      phone: {
        regex: /^[+]7\([\d]{3}\)[\d]{3}-[\d]{2}-[\d]{2}$/,
      },
    };

    var checkSumDigit = function(str) {
      var digits = str.match(/\d/g);
      var sum = 0;
      for (var i = 0, l = digits.length; i < l; i += 1) {
        sum += +digits[i];
      }
      return sum < 30;
    }

    var validate = function() {
      var form = document.getElementById('myForm');
      var childNodes = form.childNodes;
      var errorFields = [];
      for (var i = 0, l = childNodes.length; i < l; i += 1) {
        if (typeof childNodes[i].getAttribute === 'function') {
          var name = childNodes[i].getAttribute('name');
          if (name !== null) {
            if (!cult[name].regex.test(childNodes[i].value)) {
              errorFields.push(name);
            } else if (name === 'phone' && !checkSumDigit(childNodes[i].value)) {
              errorFields.push(name);
            }
          }
        }
      }
      var result = {
        isValid: errorFields.length === 0,
        errorFields,
      };
      return result;
    }

    var getData = function() {
      var result = {};
      var form = document.getElementById('myForm');
      var childNodes = form.childNodes;
      for (var i = 0, l = childNodes.length; i < l; i += 1) {
        if (typeof childNodes[i].getAttribute === 'function') {
          var name = childNodes[i].getAttribute('name');
          if (name !== null) {
            result[name] = childNodes[i].value;
          }
        }
      }
      return result;
    }

    var setData = function(formData) {
      var form = document.getElementById('myForm');
      var childNodes = form.childNodes;
      for (var i = 0, l = childNodes.length; i < l; i += 1) {
        if (typeof childNodes[i].getAttribute === 'function') {
          var name = childNodes[i].getAttribute('name');
          if (name !== null) {
            childNodes[i].value = formData[name];
          }
        }
      }
    }

    var resetForm = function() {
      var form = document.getElementById('myForm');
      var childNodes = form.childNodes;
      for (var i = 0, l = childNodes.length; i < l; i += 1) {
        if (typeof childNodes[i].removeAttribute === 'function') {
          childNodes[i].removeAttribute('class');
        }
      }
    }

    var resetResultContainer = function() {
      var resultContainer = document.getElementById('resultContainer');
      resultContainer.removeAttribute('class');
      resultContainer.innerHTML = '';
    }

    var onLoad = function() {
      if (this.responseText) {
        var resultContainer = document.getElementById('resultContainer');
        var response = JSON.parse(this.responseText);
        switch (response.status) {
          case 'success': {
            resultContainer.setAttribute('class', 'success');
            resultContainer.innerHTML = 'Success';
            document.getElementById('submitButton').removeAttribute('disabled');
            break;
          }
          case 'error': {
            resultContainer.setAttribute('class', 'error');
            resultContainer.innerHTML = response.reason;
            document.getElementById('submitButton').removeAttribute('disabled');
            break;
          }
          case 'progress': {
            resultContainer.setAttribute('class', 'progress');
            resultContainer.innerHTML = 'Loading... Repeat after ' + (response.timeout / 1000) + ' seconds';
            setTimeout(resetResultContainer, response.timeout - 1000);
            setTimeout(submit, response.timeout);
            break;
          }
        }
      }
    }

    var submit = function() {
      resetForm();
      var action = document.getElementById('myForm').getAttribute('action');
      var validation = validate();
      if (validation.isValid) {
        document.getElementById('submitButton').setAttribute('disabled', 'disabled');
        var xhr = new XMLHttpRequest();
        xhr.onload = onLoad;
        xhr.open('POST', action, true);
        xhr.send();
      } else {
        for (var i = 0, l = validation.errorFields.length; i < l; i += 1) {
          document.getElementsByName(validation.errorFields[i])[0].setAttribute('class', 'error');
          resetResultContainer();
        }
      }
    }

  MyForm = {};
  MyForm.validate = validate;
  MyForm.getData = getData;
  MyForm.setData = setData;
  MyForm.submit = submit;

  global.MyForm = MyForm;
  return MyForm;
});

function onSubmitClick() {
  console.log(window.MyForm.getData());
  window.MyForm.submit();
  return false;
}