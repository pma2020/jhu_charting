window.onload = function() {
   var script = document.getElementById('load_jhu_pma_chart');
   var id = script.getAttribute('data-id');
   var host = script.getAttribute('data-host');
   var iframe = document.createElement('iframe');
   iframe.style.width = "100%";
   iframe.style.height = "100%";
   iframe.style.margin = "0";
   iframe.style.padding = "0";
   iframe.style.border = "none";
   iframe.style.overflow = "scroll";
   iframe.src = host + "datasets/" + id + "/embed";
   document.body.appendChild(iframe);
};
