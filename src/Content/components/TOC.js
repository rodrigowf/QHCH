import React from 'react';
import { Nav, TOCTitle, TOCList, TOCItem, TOCLink } from './styled.components';

const TOC = ({ toc }) => {
  return (
    <Nav id="toc">
      <TOCTitle>Contents</TOCTitle>
      <TOCList>
        {toc.map((item, index) => (
          <TOCItem key={index} level={item.level} className={`toc-item toc-level-${item.level}`}>
            <TOCLink href={`#${item.id}`} className="toc-link">{item.text}</TOCLink>
          </TOCItem>
        ))}
      </TOCList>
    </Nav>
  );
};

export default TOC; 