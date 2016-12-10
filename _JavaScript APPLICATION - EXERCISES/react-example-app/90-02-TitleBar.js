class TitleBar extends React.Component {
    toggleVisibility() {
        $('.drawer').toggle();
    }

    render() {
        let links = this.props.links
            .map(function (link, i) {
                return <a className="menu-link" href={link[0]} key={i}>{link[1]}</a>;
            });
        return (
            <header className="header">
                <div className="header-row">
                    <a className="button" onClick={this.toggleVisibility}>&#9776;</a>
                    <span className="title">{this.props.title}</span>
                </div>
                <div className="drawer">
                    <nav className="menu">{links}</nav>
                </div>
            </header>
        );
    }
}