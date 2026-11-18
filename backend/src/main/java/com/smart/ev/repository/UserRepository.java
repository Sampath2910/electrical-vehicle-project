package com.smart.ev.repository;

import com.smart.ev.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE LOWER(TRIM(u.email)) = LOWER(TRIM(:email))")
    Optional<User> findByEmailIgnoreCase(@Param("email") String email);

    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE LOWER(TRIM(u.email)) = LOWER(TRIM(:email))")
    boolean existsByEmailIgnoreCase(@Param("email") String email);

    boolean existsByEmail(String email);

    List<User> findByRole(User.Role role);

    @Query("SELECT u FROM User u WHERE " +
           "LOWER(TRIM(u.email)) = LOWER(TRIM(:id)) " +
           "OR LOWER(TRIM(u.name)) = LOWER(TRIM(:id)) " +
           "OR (:digits <> '' AND LENGTH(:digits) >= 6 AND REPLACE(REPLACE(REPLACE(REPLACE(u.phone, ' ', ''), '-', ''), '+', ''), '(', '') LIKE CONCAT('%', :digits))")
    List<User> findByIdentifierMatches(@Param("id") String id, @Param("digits") String digits);

    default Optional<User> findByIdentifier(String rawIdentifier) {
        if (rawIdentifier == null || rawIdentifier.trim().isEmpty()) {
            return Optional.empty();
        }
        String cleanId = rawIdentifier.trim();
        Optional<User> byEmail = findByEmailIgnoreCase(cleanId);
        if (byEmail.isPresent()) {
            return byEmail;
        }

        String digits = cleanId.replaceAll("[^0-9]", "");
        if (digits.length() > 10) {
            digits = digits.substring(digits.length() - 10);
        }

        List<User> matches = findByIdentifierMatches(cleanId, digits.length() >= 6 ? digits : "");
        if (!matches.isEmpty()) {
            return Optional.of(matches.get(0));
        }
        return Optional.empty();
    }
}
