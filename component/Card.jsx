
module.exports = React.createClass(
{
    render: function() {
        return (
            <div className="card">{this.props.children}</div>
        );       
    }
});
