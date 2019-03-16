const subscribers = {};

export function init(configs) {
  const config = combineConfigs(configs);

  if (config && config.emit && typeof config.emit === 'object' && !Array.isArray(config.emit) &&
      config.on && typeof config.on === 'object' && !Array.isArray(config.on)) {
    // Set up publishers
    Object.entries(config.emit).forEach(([eventName, emitConfigs]) => {
      document.body.addEventListener(eventName, event => {
        const {detail} = event;
        let data = copy(detail);

        emitConfigs.forEach(emitConfig => {
          if (emitConfig.hasOwnProperty('prepare') && typeof emitConfig.prepare === 'function') {
            data = emitConfig.prepare(data);
          }

          publish(emitConfig.eventName, data, event);
        });
      });
    });

    // Set up subscribers
    Object.entries(config.on).forEach(([eventName, onConfigs]) => {
      onConfigs.forEach(onConfig => {
        subscribe(eventName, subscriberCallback(onConfig));
      });
    });
  }
};

export function publish(eventName, data, event) {
  if (eventName && subscribers[eventName]) {
    subscribers[eventName].forEach(listener => {
      listener(data, eventName, event);
    });
  }
}

export function subscribe(eventName, subscriber) {
  if (typeof subscriber === 'function') {
    if (subscribers[eventName]) {
      subscribers[eventName].push(subscriber);
    } else {
      subscribers[eventName] = [subscriber];
    }
  }
}

function combineConfigs(configs) {
  const finalConfig = {emit: {}, on: {}};

  if (Array.isArray(configs)) {
    configs.forEach(config => {
      if (config.emit && typeof config.emit === 'object') {
        Object.entries(config.emit).forEach(([eventName, publisher]) => {
          let newConfig = {};

          if (publisher === true) {
            newConfig.eventName = eventName;
          } else if (typeof publisher === 'string') {
            newConfig.eventName = publisher;
          } else if (typeof publisher === 'object' && !Array.isArray(publisher)) {
            newConfig = {...publisher};

            if (!newConfig.eventName) {
              newConfig.eventName = eventName;
            }
          }

          if (Object.keys(newConfig).length > 0) {
            if (finalConfig.emit[eventName]) {
              finalConfig.emit[eventName].push(newConfig);
            } else {
              finalConfig.emit[eventName] = [newConfig];
            }
          }
        });
      }

      if (config.on && typeof config.on === 'object') {
        Object.entries(config.on).forEach(([eventName, subscriber]) => {
          if (finalConfig.on[eventName]) {
            finalConfig.on[eventName].push(subscriber);
          } else {
            finalConfig.on[eventName] = [subscriber];
          }
        });
      }
    });
  }

  return finalConfig;
}

function copy(data) {
  let finalData = data;

  if (Array.isArray(data)) {
    finalData = [...data];
  } else if (typeof detail === 'object') {
    finalData = {...data};
  }

  return finalData;
};

function subscriberCallback(subscriber) {
  return (data, eventName, event) => {
    let finalData = copy(data);

    if (typeof subscriber === 'function') {
      subscriber(finalData, eventName, event);
    }
  };
}

export default {
  init,
  publish,
  subscribe
};
