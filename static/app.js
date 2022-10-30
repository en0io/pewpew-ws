optionSound = false;
optionRainbows = false;
var map = new Datamap({
  scope: "world",
  element: document.getElementById("container1"),
  projection: "winkel3",
  fills: { defaultFill: "black" },
  geographyConfig: {
    dataUrl: null,
    hideAntarctica: true,
    borderWidth: 0.75,
    borderColor: "#4393c3",
    popupTemplate: function (geography, data) {
      return (
        '<div class="hoverinfo" style="color:white;background:black">' +
        geography.properties.name +
        "</div>"
      );
    },
    popupOnHover: true,
    highlightOnHover: false,
    highlightFillColor: "black",
    highlightBorderColor: "rgba(250, 15, 160, 0.2)",
    highlightBorderWidth: 2,
  },
});

function FixedQueue(size, initialValues) {
  initialValues = initialValues || [];
  var queue = Array.apply(null, initialValues);
  queue.fixedSize = size;
  queue.push = FixedQueue.push;
  queue.splice = FixedQueue.splice;
  queue.unshift = FixedQueue.unshift;
  FixedQueue.trimTail.call(queue);
  return queue;
}

FixedQueue.trimHead = function () {
  if (this.length <= this.fixedSize) {
    return;
  }
  Array.prototype.splice.call(this, 0, this.length - this.fixedSize);
};
FixedQueue.trimTail = function () {
  if (this.length <= this.fixedSize) {
    return;
  }
  Array.prototype.splice.call(
    this,
    this.fixedSize,
    this.length - this.fixedSize
  );
};
FixedQueue.wrapMethod = function (methodName, trimMethod) {
  var wrapper = function () {
    var method = Array.prototype[methodName];
    var result = method.apply(this, arguments);
    trimMethod.call(this);
    return result;
  };
  return wrapper;
};

FixedQueue.push = FixedQueue.wrapMethod("push", FixedQueue.trimHead);
FixedQueue.splice = FixedQueue.wrapMethod("splice", FixedQueue.trimTail);
FixedQueue.unshift = FixedQueue.wrapMethod("unshift", FixedQueue.trimTail);

var hits = FixedQueue(7, []);
var boom = FixedQueue(7, []);

d3.select(window).on("resize", function () {
  location.reload();
});

function establish_websocket_conn() {
  var ws = new WebSocket("wss://" + window.location.hostname + "/ws/");
  ws.onopen = function () {
    // subscribe to some channels
    if (typeof retry !== "undefined") clearInterval(retry);
    console.log("connected!");
    $("#connstat").html("live");
    $("#connstat").addClass("connected");
    $("#connstat").removeClass("disconnected");
  };
  ws.onmessage = function (event) {
    if (!document.hidden) {
      drawHit(event.data);
      pushToAttackDiv(event.data);
    }
  };
  ws.onerror = function (err) {
    console.error("Socket encountered error: ", err.message, "Closing socket");
    ws.close();
  };
  ws.onclose = (event) => {
    console.log("The connection has been closed, retrying in 1s");
    $("#connstat").html("disconnected");
    $("#connstat").addClass("disconnected");
    $("#connstat").removeClass("connected");
    if (typeof retry == "undefined") {
      retry = setInterval(function () {
        establish_websocket_conn();
      }, 1000);
    }
  };
}

//Open the connection
$(document).ready(function () {
  establish_websocket_conn();
});

function about() {
  $("#about").modal();
}

colorIndex = 0;

function getRandomColor() {
  colors = [
    "darkviolet",
    "darkmagenta",
    "deepskyblue",
    "mediumspringgreen",
    "gold",
    "orange",
    "red",
  ];
  color = colors[colorIndex];
  if (colorIndex < colors.length - 1) {
    colorIndex++;
  } else {
    colorIndex = 0;
  }
  return color;
}

function lookupColor(comment) {
  switch (comment.trim()) {
    case "fail2ban found":
      c = "deepskyblue";
      break;
    case "fail2ban block":
      c = "darkviolet";
      break;
    case "rejected by firewall":
      c = "crimson";
      break;
    default:
      c = "deeppink";
  }
  delete comment;
  return c;
}

function drawHit(eventdata) {
  attack = eventdata.split(",");
  if (optionRainbows === true) {
    color = getRandomColor();
  } else {
    color = lookupColor(attack[10]);
  }

  hits.push({
    origin: {
      latitude: Number(attack[2]).toFixed(4),
      longitude: Number(attack[3]).toFixed(4),
    },
    destination: {
      latitude: Number(attack[5]).toFixed(4),
      longitude: Number(attack[6]).toFixed(4),
    },
  });
  map.arc(hits, { strokeWidth: 2, strokeColor: color });
  boom.push({
    radius: 7,
    latitude: Number(attack[5]).toFixed(4),
    longitude: Number(attack[6]).toFixed(4),
    fillOpacity: 0.5,
    attk: attack[8] + "/" + attack[9],
  });
  map.bubbles(boom, {
    popupTemplate: function (geo, data) {
      return (
        '<div class="hoverinfo"><p>Reason: ' +
        attack[10] +
        "</p><p>Source: " +
        attack[0] +
        "</p><p>" +
        attack[8] +
        "/" +
        attack[9] +
        "</p></div>"
      );
    },
  });
  if (optionSound === true) {
    document.getElementById("chirp").play();
  }
  delete attack;
  delete color;
  return;
}

function pushToAttackDiv(eventdata) {
  attack = eventdata.split(",");
  $("#attackdiv").append(
    '<span class="attackdiv_entry">' +
      attack[4] +
      " (" +
      attack[0] +
      ") " +
      " <span style='color:red'>attacks</span> " +
      attack[7] +
      " <span style='color:steelblue'>(" +
      attack[8] +
      "/" +
      attack[9] +
      ", " +
      attack[10] +
      ")</span><br/></span>"
  );
  $("#attackdiv").animate(
    { scrollTop: $("#attackdiv").prop("scrollHeight") },
    500
  ); /**/
  while ($(".attackdiv_entry").length > 50) {
    $(".attackdiv_entry").first().remove();
  }
  delete attack;
  return;
}

function toggleColors() {
  if (optionRainbows === true) {
    optionRainbows = false;
    $("#rainbow-status").html("Turn On");
  } else {
    optionRainbows = true;
    $("#rainbow-status").html("Turn Off");
  }
}

function toggleSound() {
  if (optionSound === true) {
    optionSound = false;
    $("#sound-status").html("Turn On");
  } else {
    optionSound = true;
    $("#sound-status").html("Turn Off");
  }
}
