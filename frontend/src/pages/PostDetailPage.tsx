import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Form, Input, message } from 'antd';
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Post } from '../types';

function formatCommentContent(content: string) {
  return content.startsWith('댓글 :') ? content : `댓글 : ${content}`;
}

export function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);

  const loadPost = async () => {
    const { data } = await api.get<Post>(`/posts/${id}`);
    setPost(data);
  };

  useEffect(() => {
    void loadPost();
  }, [id]);

  const canEdit =
    user && post && (user.role === 'admin' || user.id === post.authorId);

  const handleDelete = async () => {
    if (!window.confirm('게시글을 삭제할까요?')) return;
    await api.delete(`/posts/${id}`);
    message.success('삭제되었습니다.');
    navigate('/posts');
  };

  const handleComment = async (values: { content: string }) => {
    try {
      setLoading(true);
      await api.post(`/posts/${id}/comments`, values);
      message.success('댓글이 등록되었습니다.');
      await loadPost();
    } finally {
      setLoading(false);
    }
  };

  const handleCommentDelete = async (commentId: number) => {
    await api.delete(`/comments/${commentId}`);
    message.success('댓글이 삭제되었습니다.');
    await loadPost();
  };

  if (!post) {
    return <div className="page-loading">불러오는 중...</div>;
  }

  return (
    <section className="page-card">
      <h1 className="page-title">{post.title}</h1>
      <div className="post-meta">
        {post.author?.name} · {new Date(post.createdAt).toLocaleString()}
      </div>
      <p style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }}>{post.content}</p>

      {canEdit && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <Link to={`/posts/${post.id}/edit`}>
            <Button>수정</Button>
          </Link>
          <Button danger onClick={handleDelete}>
            삭제
          </Button>
        </div>
      )}

      <h2 style={{ marginTop: '2rem' }}>댓글</h2>
      <ul className="comment-list">
        {(post.comments ?? []).map((comment) => {
          const canDeleteComment =
            user && (user.role === 'admin' || user.id === comment.authorId);
          return (
            <li key={comment.id} className="comment-item">
              <div className="comment-meta">
                {comment.author?.name} · {new Date(comment.createdAt).toLocaleString()}
              </div>
              <div>{formatCommentContent(comment.content)}</div>
              {canDeleteComment && (
                <Button
                  size="small"
                  danger
                  style={{ marginTop: '0.5rem' }}
                  onClick={() => handleCommentDelete(comment.id)}
                >
                  삭제
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      {user ? (
        <Form layout="vertical" onFinish={handleComment} style={{ marginTop: '1rem' }}>
          <Form.Item
            name="content"
            rules={[{ required: true, message: '댓글 내용을 입력하세요.' }]}
          >
            <Input.TextArea rows={3} placeholder="댓글을 입력하세요." />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            댓글 등록
          </Button>
        </Form>
      ) : (
        <p>
          댓글을 작성하려면 <Link to="/login">로그인</Link>하세요.
        </p>
      )}
    </section>
  );
}
