var WithReactMixin, createMixin, invariant;

invariant = require('invariant');

createMixin = function(db) {
  var Mixin;
  return Mixin = {
    componentWillMount: function() {
      invariant(this.observeData != null, 'You must implement observeData: ' + this.constructor.displayName);
      this.subscription = null;
      this.prevData = null;
      this.data = {};
      if (this.shouldComponentUpdate != null) {
        this._userShouldComponentUpdate = this.shouldComponentUpdate;
        this.shouldComponentUpdate = this._shouldComponentUpdate;
      }
      return this._refresh();
    },
    _shouldComponentUpdate: function(nextProps, nextState, nextContext) {
      var nextData;
      nextData = this.data;
      this.data = this.prevData;
      try {
        return this._userShouldComponentUpdate(nextProps, nextState, nextData, nextContext);
      } finally {
        this.data = nextData;
        this.prevData = this.data;
      }
    },
    _refresh: function() {
      if (this.subscription) {
        this.subscription.dispose();
      }
      this.subscription = db.observe(this.observeData);
      return this.subscription.subscribe(this._setData);
    },
    _setData: function(nextData, prevData) {
      if (this.componentWillReceiveData) {
        this.componentWillReceiveData(nextData);
      }
      this.prevData = this.data;
      this.data = nextData;
      if (prevData) {
        return this.setState({});
      }
    },
    componentWillUpdate: function(nextProps, nextState) {
      var prevProps, prevState;
      prevProps = this.props;
      prevState = this.state;
      this.props = nextProps;
      this.state = nextState;
      try {
        return this._refresh();
      } finally {
        this.props = prevProps;
        this.state = prevState;
      }
    },
    componentWillUnmount: function() {
      if (this.subscription) {
        return this.subscription.dispose();
      }
    }
  };
};

WithReactMixin = {
  getReactMixin: function() {
    if (this.mixin == null) {
      this.mixin = createMixin(this);
    }
    return this.mixin;
  }
};

module.exports = WithReactMixin;
