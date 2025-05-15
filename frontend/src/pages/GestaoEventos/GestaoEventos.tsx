import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Col, Row, Typography, Form, Input, DatePicker, TimePicker, Upload, message, Modal, Image as AntImage } from 'antd';
import { UploadOutlined, EditOutlined, DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import moment from 'moment'; // Para manipulação de datas e horas
// import AppLayout from '../../components/AppLayout/AppLayout'; // Supondo um componente de Layout
import useAuthStore from '../../store/authStore'; // Para obter o token
import { getAuthToken } from "../../utils/auth"; // Para obter o token

const { Title } = Typography;
const { confirm } = Modal;

// Interface para o tipo de dados do evento
interface Evento {
  id?: string;
  titulo: string;
  data: string; 
  hora: string; 
  descricao: string;
  imagem_url?: string; // Alterado para corresponder ao backend
  google_meet_link?: string;
  criado_em?: string;
  atualizado_em?: string;
}

const API_URL = 'http://localhost:3001/api'; // Ajustar se o backend estiver em outra URL/porta

const GestaoEventos: React.FC = () => {
  const [form] = Form.useForm();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEventos, setLoadingEventos] = useState(false);
  const [imagemArquivo, setImagemArquivo] = useState<File | null>(null);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const { token } = useAuthStore(); // Ou use getAuthToken()
  const authToken = getAuthToken() || token;

  const fetchEventos = useCallback(async () => {
    setLoadingEventos(true);
    try {
      const response = await fetch(`${API_URL}/eventos`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        throw new Error('Falha ao buscar eventos');
      }
      const data = await response.json();
      setEventos(data);
    } catch (error: any) {
      message.error(error.message || 'Erro ao carregar eventos.');
    }
    setLoadingEventos(false);
  }, [authToken]);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  const handleUploadChange = (info: any) => {
    if (info.file.status === 'done' || info.file.status === 'uploading' || info.file.status === 'removed') {
        if (info.file.originFileObj) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_WIDTH) {
                        height = (MAX_WIDTH / width) * height;
                        width = MAX_WIDTH;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const resizedFile = new File([blob], info.file.name, {
                                type: info.file.type,
                                lastModified: Date.now(),
                            });
                            setImagemArquivo(resizedFile);
                            message.success(`${info.file.name} carregado e pronto para envio.`);
                        } else {
                            message.error('Erro ao redimensionar a imagem.');
                            setImagemArquivo(info.file.originFileObj as File);
                        }
                    }, info.file.type);
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(info.file.originFileObj as File);
        } else {
             setImagemArquivo(null);
        }
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} falhou ao carregar.`);
      setImagemArquivo(null);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('titulo', values.titulo);
    formData.append('data', values.data.format('YYYY-MM-DD'));
    formData.append('hora', values.hora.format('HH:mm:ss'));
    formData.append('descricao', values.descricao);
    if (values.googleMeetLink) {
      formData.append('googleMeetLink', values.googleMeetLink);
    }
    if (imagemArquivo) {
      formData.append('imagem', imagemArquivo);
    }

    try {
      let response;
      if (editingEvento && editingEvento.id) {
        // Se imagemArquivo for null e não houver imagemUrl no form, não envia o campo imagem
        // Se houver imagemUrl no form (para manter ou remover), o backend tratará
        if (!imagemArquivo && values.imagemUrl !== undefined) {
            formData.append('imagemUrl', values.imagemUrl); // Para o backend saber se deve manter ou remover
        }
        response = await fetch(`${API_URL}/eventos/${editingEvento.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
          body: formData,
        });
      } else {
        response = await fetch(`${API_URL}/eventos`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
          body: formData,
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao salvar evento');
      }

      message.success(`Evento ${editingEvento ? 'atualizado' : 'criado'} com sucesso!`);
      form.resetFields();
      setImagemArquivo(null);
      setEditingEvento(null);
      fetchEventos(); // Recarregar lista de eventos
    } catch (error: any) {
      message.error(error.message || 'Erro ao salvar o evento.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (evento: Evento) => {
    setEditingEvento(evento);
    form.setFieldsValue({
      titulo: evento.titulo,
      data: moment(evento.data), // Converter string para moment object
      hora: moment(evento.hora, 'HH:mm:ss'), // Converter string para moment object
      descricao: evento.descricao,
      googleMeetLink: evento.google_meet_link,
      // A imagem não é setada diretamente no Upload, o usuário precisa carregar uma nova se quiser mudar
      // Ou podemos mostrar a imagem atual e ter uma opção para remover/alterar
      imagemUrl: evento.imagem_url // Para controle interno se a imagem deve ser mantida/removida
    });
    setImagemArquivo(null); // Limpa seleção de arquivo anterior
  };

  const handleDelete = (eventoId?: string) => {
    if (!eventoId) return;
    confirm({
      title: 'Você tem certeza que deseja deletar este evento?',
      icon: <ExclamationCircleFilled />,
      content: 'Esta ação não pode ser desfeita.',
      okText: 'Sim, deletar',
      okType: 'danger',
      cancelText: 'Não, cancelar',
      onOk: async () => {
        try {
          const response = await fetch(`${API_URL}/eventos/${eventoId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${authToken}`,
            },
          });
          if (!response.ok && response.status !== 204) { // 204 é sucesso sem conteúdo
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao deletar evento');
          }
          message.success('Evento deletado com sucesso!');
          fetchEventos(); // Recarregar lista de eventos
        } catch (error: any) {
          message.error(error.message || 'Erro ao deletar o evento.');
        }
      },
    });
  };

  const handleCancelEdit = () => {
    setEditingEvento(null);
    form.resetFields();
    setImagemArquivo(null);
  }

  return (
    // <AppLayout> 
    <div style={{ padding: '24px' }}>
      <Title level={2}>Gestão de Eventos</Title>
      <Row gutter={24}>
        <Col xs={24} md={10} lg={8}>
          <Card title={editingEvento ? "Editar Evento" : "Criar Novo Evento"}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                name="titulo"
                label="Título do Evento"
                rules={[{ required: true, message: 'Por favor, insira o título!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="data"
                label="Data"
                rules={[{ required: true, message: 'Por favor, selecione a data!' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
              <Form.Item
                name="hora"
                label="Hora"
                rules={[{ required: true, message: 'Por favor, selecione a hora!' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
              <Form.Item
                name="descricao"
                label="Descrição"
                rules={[{ required: true, message: 'Por favor, insira a descrição!' }]}
              >
                <Input.TextArea rows={4} />
              </Form.Item>
              <Form.Item label="Imagem do Evento">
                {editingEvento && editingEvento.imagem_url && (
                    <div style={{ marginBottom: 8 }}>
                        <p>Imagem atual:</p>
                        <AntImage width={200} src={`${API_URL.replace('/api','/')}${editingEvento.imagem_url}`} alt={editingEvento.titulo} /> 
                        {/* Se a imagemUrl não for completa, precisará de ajuste */}
                    </div>
                )}
                <Upload
                  name="imagem"
                  listType="picture"
                  beforeUpload={() => false} 
                  onChange={handleUploadChange}
                  onRemove={() => setImagemArquivo(null)}
                  maxCount={1}
                  fileList={imagemArquivo ? [imagemArquivo as any] : []}
                >
                  <Button icon={<UploadOutlined />}>{editingEvento && editingEvento.imagem_url ? 'Alterar Imagem' : 'Clique para Carregar'}</Button>
                </Upload>
                 {editingEvento && editingEvento.imagem_url && !imagemArquivo && (
                    <Button style={{marginTop: '8px'}} type="link" danger onClick={() => {
                        form.setFieldsValue({ imagemUrl: null }); // Sinaliza para remover a imagem
                        message.info("Imagem marcada para remoção. Salve para confirmar.")
                    }}>
                        Remover Imagem Atual
                    </Button>
                )}
              </Form.Item>
              <Form.Item name="googleMeetLink" label="Link do Google Meet">
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
                  {editingEvento ? 'Salvar Alterações' : 'Criar Evento'}
                </Button>
                {editingEvento && (
                    <Button onClick={handleCancelEdit} loading={loading}>
                        Cancelar Edição
                    </Button>
                )}
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col xs={24} md={14} lg={16}>
          <Card title="Eventos Cadastrados" loading={loadingEventos}>
            {eventos.length === 0 && !loadingEventos && <p>Nenhum evento cadastrado.</p>}
            {eventos.map(evento => (
              <Card key={evento.id} style={{ marginBottom: 16 }} 
                actions={[
                    <EditOutlined key="edit" onClick={() => handleEdit(evento)} />,
                    <DeleteOutlined key="delete" onClick={() => handleDelete(evento.id)} />,
                ]}>
                <Card.Meta
                  avatar={evento.imagem_url ? <AntImage width={64} src={`${API_URL.replace('/api','/')}${evento.imagem_url}`} /> : null}
                  title={evento.titulo}
                  description={<>
                    <p>Data: {moment(evento.data).format('DD/MM/YYYY')} às {moment(evento.hora, 'HH:mm:ss').format('HH:mm')}</p>
                    <p>{evento.descricao}</p>
                    {evento.google_meet_link && <p><a href={evento.google_meet_link} target="_blank" rel="noopener noreferrer">Link da Reunião</a></p>}
                  </>}
                />
              </Card>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
    // </AppLayout>
  );
};

export default GestaoEventos;

