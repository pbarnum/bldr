import React, { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { AppContext } from '../App';
import AvailableTemplates from '../components/AvailableTemplates';
import DisplayTemplate from '../components/DisplayTemplate';
import ImportTemplates from '../components/ImportTemplates';
import TemplatesHeader from '../components/TemplatesHeader';
import Unauthorized from '../components/Unauthorized';
import storage from '../storage';
import { Template } from '../types/template';

const Templates = (): React.ReactElement => {
  const { userId } = useParams();
  const ctx: AppContext = useOutletContext();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  useEffect(() => {
    document.title = 'Templates - Bldr';
  }, []);

  const selectedTemplateCallback = (template: Template | null) => {
    setSelectedTemplate(template);
  };

  if (!ctx.user || !storage.isUser || !userId) {
    return <Unauthorized title="Unauthorized" message="You cannot view templates without being logged in!" />;
  }

  return (
    <>
      <TemplatesHeader />
      <ImportTemplates />
      <AvailableTemplates userId={userId} selectedCallback={selectedTemplateCallback} />
      <hr className="my-4" />
      <DisplayTemplate template={selectedTemplate} />
    </>
  );
};

export default Templates;
